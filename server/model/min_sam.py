import numpy as np
import torch
import cv2
from segment_anything import sam_model_registry, SamPredictor

class BackendSAM:
    def __init__(self):
        self.device = "cpu"
        self.sam_checkpoint = "./server/model/sam_model/sam_vit_h_4b8939.pth"
        self.sam_type = "vit_h"
        self.sam_mask_generator = None
        self.sam = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.sam_predictor = None
        self.output_package = {
            "segmentation": None,
            "outline": None
        }
        self.max_pixel_area = 262144 #based on 512x512
        self.orig_h = 0
        self.orig_w = 0
        self.scaled_h = 0
        self.scaled_w = 0
        self.initialize()

    def fetch_output_package(self):
        return self.output_package

    def does_not_need_resizing(self, pixel_area):
        if pixel_area <= self.max_pixel_area:
            return True
        else:
            return False

    def resize_img(self, img, h, w):
        img = img.astype("float32")
        img = cv2.resize(
            img,
            dsize=(h, w),
            interpolation=cv2.INTER_LINEAR #INTER_CUBIC
        )
        return img.astype(np.uint8)
        
    def rescale_boxes(self, boxes):
        boxes_np = np.asarray(boxes)
        orig_scale_coefs = np.asarray([
            self.orig_w, self.orig_h,
            self.orig_w, self.orig_h
        ])
        new_scale_coefs = np.asarray([
            self.scaled_w, self.scaled_h,
            self.scaled_w, self.scaled_h
        ])
        rescaled_boxes = boxes_np/orig_scale_coefs*new_scale_coefs
        return rescaled_boxes.tolist()

    def prepare_boxes_and_img(self, boxes, img):
        img_shape = img.shape
        pixel_area = img_shape[0]*img_shape[1]

        if self.does_not_need_resizing(pixel_area):
            return img

        orig_h = img_shape[0]
        orig_w = img_shape[1]
        hw_ratio = orig_h/orig_w

        x = orig_w - np.sqrt(orig_w*self.max_pixel_area/orig_h)
        new_w = orig_w - x
        new_h = orig_h - x*hw_ratio

        self.orig_h = int(orig_h)
        self.orig_w = int(orig_w)
        self.scaled_h = int(new_h)
        self.scaled_w = int(new_w)

        final_img = self.resize_img(img, self.scaled_h, self.scaled_w)
        final_boxes = self.rescale_boxes(boxes)
        
        return final_boxes, final_img

    def update_sam_context(self, context_img):
        self.sam_predictor.set_image(context_img)

    def init_sam(self):
        self.sam = sam_model_registry[
            self.sam_type
        ](checkpoint=self.sam_checkpoint)
        self.sam.to(device=self.device)
        self.sam_predictor = SamPredictor(self.sam)
        

    def initialize(self):
        self.init_sam()

    def get_sam_masks(self, boxes, context_img):
        tensor_boxes = torch.tensor(boxes, device=self.device)
        transformed_boxes = self.sam_predictor.transform.apply_boxes_torch(
            tensor_boxes, context_img.shape[:2])
        masks, _, _ = self.sam_predictor.predict_torch(
            point_coords=None,
            point_labels=None,
            boxes=transformed_boxes,
            multimask_output=False)
        masks = masks.cpu().numpy()
        return masks

    def process(self, boxes, img):
        prepared_boxes, prepared_img = self.prepare_boxes_and_img(boxes, img)
        self.update_sam_context(prepared_img)
        sam_masks = self.get_sam_masks(prepared_boxes, prepared_img)

        id_mask =  self.generate_id_mask(prepared_img, sam_masks)
        # id_mask = self.resize_img(id_mask, self.orig_h, self.orig_w) doesnt work

        segment_img = self.generate_colored_mask(id_mask)
        segment_img = self.resize_img(segment_img, self.orig_h, self.orig_w)

        contour = self.generate_advanced_contour_img(id_mask)
        contour = self.resize_img(contour, self.orig_w, self.orig_h)
        # anti_ctr = self.generate_anti_contour(contour).astype(np.uint8)
        outline_img = prepared_img.astype(np.uint8)
        # outline_img *= anti_ctr
        outline_img = np.where(contour > 0, 255, img)
        # outline_img += contour
        # outline_img = self.resize_img(outline_img, self.orig_h, self.orig_w)


        self.output_package["segmentation"] = segment_img
        self.output_package["outline"] = outline_img

        return segment_img, outline_img

    def generate_anti_contour(self, base_contour):
        anti_mask = np.where(base_contour > 0, 0, 1)
        return anti_mask

    def generate_advanced_contour_img(self, mask_img):
        contour_col = (255, 255, 255)
        contour_shape = (mask_img.shape[0], mask_img.shape[1], 3)
        final_contour_img = np.zeros(contour_shape, dtype=np.uint8)
        gray_mask = mask_img.astype(np.uint8)
        max_id = mask_img.max()
    
        # gray_mask = cv2.cvtColor(mask_img.astype(np.uint8), cv2.COLOR_BGR2GRAY)
        for id in range(1, max_id+1):
            contour_img = np.zeros(contour_shape, dtype=np.uint8)
            mask_instance = np.where(gray_mask == id, 255, 0).astype(np.uint8)
            cnts = cv2.findContours(mask_instance, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cnts = cnts[0] if len(cnts) == 2 else cnts[1]
            for c in cnts:
                cv2.drawContours(contour_img, [c], -1, contour_col, thickness=1)
            final_contour_img += contour_img
            final_contour_img = np.where(final_contour_img > 0, 255, 0).astype(np.uint8)
        return final_contour_img
    
    def generate_id_mask(self, base_img, masks):
        mask_shape = (base_img.shape[0], base_img.shape[1])
        mask_img = np.zeros(mask_shape)
        instance_id = 0
        for m in masks:
            m = m[0,:,:]
            instance_id += 1
            mask_instance = np.zeros(mask_shape)
            segment_instance = np.where(m == True, instance_id, 0)
            mask_instance += segment_instance
            mask_img += mask_instance
        return mask_img.astype(int)
        
    def generate_colored_mask(self, mask_img):
        color_shape = (mask_img.shape[0], mask_img.shape[1], 3)
        color_mask = np.zeros(color_shape)
        for segment_id in range(1, int(mask_img.max())+1):
            id_instance = np.where(mask_img == segment_id, segment_id, 0)
            color_instance = np.where(mask_img == segment_id, 1, 0)
            red_pix = np.random.randint(256, size=1)[0]
            green_pix = np.random.randint(256, size=1)[0]
            blue_pix = np.random.randint(256, size=1)[0]
    
            #When the color is close to black default to making it white
            if (red_pix + green_pix + blue_pix) <= 5:
                red_pix = 255
                green_pix = 255
                blue_pix = 255
            color_mask[:,:,0] += color_instance*red_pix
            color_mask[:,:,1] += color_instance*green_pix
            color_mask[:,:,2] += color_instance*blue_pix
        color_mask = color_mask.astype(int)
        return color_mask

if __name__ == "__main__":
    img_path = "example_imgs/backend_sam_test.png"
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    img = img[:,:,:3]
    boxes = [
        [610, 160, 830, 380],
        [650, 220, 790, 340],
        [440, 300, 730, 480],
        [500, 380, 660, 480]
    ]
    backend = BackendSAM() 
    seg_img, outline_img = backend.process(boxes, img)
    seg_path = "example_imgs/backend_sam_test_segment.png"
    outline_path = "example_imgs/backend_sam_test_outline.png"
    cv2.imwrite(seg_path, seg_img)
    cv2.imwrite(outline_path, outline_img)











