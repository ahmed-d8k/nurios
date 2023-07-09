import solid from "solid-start/vite";
import { defineConfig } from "vite";
import staticAdapter from 'solid-start-static';

export default defineConfig({
  base: "/nurios/",
  plugins: [solid({ adapter: staticAdapter() })],
});