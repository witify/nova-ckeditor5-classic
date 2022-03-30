Nova.booting((Vue, router, store) => {
    Vue.component('index-ckeditor5-classic-field', require('./components/IndexField.vue').default)
    Vue.component('detail-ckeditor5-classic-field', require('./components/DetailField.vue').default)
    Vue.component('form-ckeditor5-classic-field', require('./components/FormField.vue').default)
})
