export default {
  bind(el, binding) {
    el.innerHTML = el.innerHTML.trim()
      ? el.innerHTML
      : binding.value
      ? binding.value.replaceString
      : '-';
  },
  update(el, binding) {
    el.innerHTML = el.innerHTML.trim()
      ? el.innerHTML
      : binding.value
      ? binding.value.replaceString
      : '-';
  },
  unbind(el) {
    el.innerHTML = '';
  }
};
