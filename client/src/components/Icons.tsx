export const ColorIcon = () => {
  return (
    <svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg"
         class="icon icon-tabler icon-tabler-color-filter" width="1em" height="1em" viewBox="0 0 24 24"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path
        d="M13.58 13.79c.27 .68 .42 1.43 .42 2.21c0 1.77 -.77 3.37 -2 4.46a5.93 5.93 0 0 1 -4 1.54c-3.31 0 -6 -2.69 -6 -6c0 -2.76 1.88 -5.1 4.42 -5.79"></path>
      <path d="M17.58 10.21c2.54 .69 4.42 3.03 4.42 5.79c0 3.31 -2.69 6 -6 6a5.93 5.93 0 0 1 -4 -1.54"></path>
      <path d="M12 8m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"></path>
    </svg>
  );
}

export const SubmitIcon = () => {
  return (
    <svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em"
         width="1em" style="overflow: visible;">
      <path
        d="m1 1.91.78-.41L15 7.449v.95L1.78 14.33 1 13.91 2.583 8 1 1.91ZM3.612 8.5 2.33 13.13 13.5 7.9 2.33 2.839l1.282 4.6L9 7.5v1H3.612Z"></path>
    </svg>
  )
}

export const UndoIcon = () => {
  return (
    <svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em"
         width="1em" style="overflow: visible;">
      <path
        d="M8 1a7.979 7.979 0 0 0-5.657 2.343L0 1v6h6L3.757 4.757a6 6 0 1 1 8.211 8.743l1.323 1.5A8 8 0 0 0 8 1z"></path>
    </svg>
  );
}

export const ResetIcon = ({cls}: { cls: string }) => {
  return (
    <svg class={cls} fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
         height="1em"
         width="1em" style="overflow: visible;">
      <path d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z"></path>
      <path
        d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z"></path>
    </svg>
  );

}

export const CheckIcon = () => {
  return (
    <svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="1em"
         width="1em" style="overflow: visible;">
      <path d="M416 128 192 384l-96-96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="32px"></path>
    </svg>
  );

}