import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    env: {
      FORCE_COLOR: '1',
    },
  },
});
