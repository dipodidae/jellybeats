export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      neutral: 'neutral',
    },
    button: {
      slots: {
        base: 'font-medium tracking-wide',
      },
    },
    card: {
      slots: {
        root: 'bg-elevated ring-1 ring-default/60 rounded-lg divide-y divide-default/40 backdrop-blur',
      },
    },
  },
})
