// https://vitepress.dev/guide/custom-theme
// @ts-ignore
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
// @ts-ignore
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'
import { NolebaseInlineLinkPreviewPlugin } from '@nolebase/vitepress-plugin-inline-link-preview/client'
// @ts-ignore
import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'

import BackToTopButton from '@miletorix/vitepress-back-to-top-button'
// @ts-ignore
import '@miletorix/vitepress-back-to-top-button/style.css'

import { ImageGroup } from '@miletorix/vitepress-image-group'
// @ts-ignore
import '@miletorix/vitepress-image-group/style.css'

// @ts-ignore
import LargeLinkCard from './components/LargeLinkCard.vue'
// @ts-ignore
import MiniLinkCard from './components/MiniLinkCard.vue'
// @ts-ignore
import MediumLinkCard from './components/MediumLinkCard.vue'
// @ts-ignore
import FileTree from './components/FileTree.vue'
// @ts-ignore
import StepperContainerWrapper from './components/plugins/StepperContainerWrapper.vue'

// @ts-ignore
import SpeedInsights from './components/integrations/SpeedInsights.vue'
// @ts-ignore
import './style.css'
// @ts-ignore
import './styles/acrylic-navbar.css'
// @ts-ignore
import './styles/home.css'
// @ts-ignore
import './styles/patches.css'
// @ts-ignore
import './styles/plugins/demo-container.css'
// @ts-ignore
import './styles/plugins/stepper-container.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 为较宽的屏幕的导航栏添加阅读增强菜单
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu),
      // 为较窄的屏幕（通常是小于 iPad Mini）添加阅读增强菜单
      'nav-screen-content-after': () => h(NolebaseEnhancedReadabilitiesScreenMenu),
      // Add Vercel Speed Insights
      'layout-bottom': () => h(SpeedInsights),
    })
  },
  enhanceApp({ app }) {
    app.component('LargeLinkCard', LargeLinkCard)
    app.component('MiniLinkCard', MiniLinkCard)
    app.component('MediumLinkCard', MediumLinkCard)
    app.component('FileTree', FileTree)
    app.component('StepperContainerWrapper', StepperContainerWrapper)
    app.component('SpeedInsights', SpeedInsights)
    app.component('ImageGroup', ImageGroup)
    app.use(NolebaseInlineLinkPreviewPlugin)
    BackToTopButton(app, {
      progressColor: '#3451b2',
    })
  },
} satisfies Theme
