import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './common/mutations';
import actions from './common/actions';
import state from './common/state';

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  actions,
  mutations,
  modules: {}
});
