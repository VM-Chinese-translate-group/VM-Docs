// https://vitepress.dev/guide/custom-theme
// @ts-ignore
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";


// @ts-ignore
import LargeLinkCard from "./components/LargeLinkCard.vue";
// @ts-ignore
import MiniLinkCard from "./components/MiniLinkCard.vue";
// @ts-ignore
import MediumLinkCard from "./components/MediumLinkCard.vue";
// @ts-ignore
import FileTree from "./components/FileTree.vue";
import "./style.css";

import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client'

import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'

import {
  NolebaseInlineLinkPreviewPlugin,
} from '@nolebase/vitepress-plugin-inline-link-preview/client'

import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 为较宽的屏幕的导航栏添加阅读增强菜单
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu),
      // 为较窄的屏幕（通常是小于 iPad Mini）添加阅读增强菜单
      'nav-screen-content-after': () => h(NolebaseEnhancedReadabilitiesScreenMenu),
    });
  },
  enhanceApp({ app }) {
    app.component("LargeLinkCard", LargeLinkCard);
    app.component("MiniLinkCard", MiniLinkCard);
    app.component("MediumLinkCard", MediumLinkCard);
    app.component("FileTree", FileTree);
    app.use(NolebaseInlineLinkPreviewPlugin)
  }
} satisfies Theme;
