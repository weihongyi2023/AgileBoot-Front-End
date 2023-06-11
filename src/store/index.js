import { createStore } from 'vuex';
import app from './modules/app';
import user from './modules/user';
import tagsView from './modules/tagsView';
import permission from './modules/permission';
import settings from './modules/settings';
import getters from './getters';
import mall from "@/store/modules/mall";

const store = createStore({
  modules: {
    app,
    user,
    tagsView,
    permission,
    settings,
    mall
  },
  getters,
});

export default store;
