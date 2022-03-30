<template>
    <default-field :field="field" :errors="errors" :full-width-content="true">
        <template slot="field">
            <div class="rounded-lg form-control auto-height">
                <ckeditor
                    :editor="editor"
                    :config="editorConfig"
                    :id="field.name"
                    :class="errorClasses"
                    :placeholder="field.name"
                    v-model="value"
                    @ready="setEditorInitialValue"
                />
            </div>
        </template>
    </default-field>
</template>

<script>
import { FormField, HandlesValidationErrors } from 'laravel-nova'
import CKEditor from '@ckeditor/ckeditor5-vue2'
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

import NovaCKEditor5UploadAdapter from '../ckeditor5/upload-adapter'

class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKFinder,
	CloudServices,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
    HtmlEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation
];

export default {
    mixins: [FormField, HandlesValidationErrors],

    components: {
        ckeditor: CKEditor.component
    },

    props: ['resourceName', 'resourceId', 'field'],

    data () {
        return {
            editor: ClassicEditor,
            defaultEditorConfig: {
                nova: {
                    resourceName: this.resourceName,
                    field: this.field,
                    draftId: uuidv4()
                },
                language: 'en',
                toolbar: this.field.options.toolbar,
                heading: this.field.options.heading,
                image: this.field.options.image,
                fontFamily: this.field.options.fontFamily,
                mediaEmbed: {
                    previewsInData: true,
                },
                extraPlugins: [
                    //this.createUploadAdapterPlugin,
                ],
                link: this.field.options.link
            }
        }
    },

    computed: {
        draftId: function () {
            return this.defaultEditorConfig.nova.draftId
        },
        editorConfig: function() {
            let editorConfig = this.defaultEditorConfig

            return editorConfig
        }
    },

    beforeDestroy() {
        this.cleanUp()
    },

    methods: {
        /**
         * Set the initial, internal value for the field.
         */
        setInitialValue() {
            //
        },

        /**
         * Set the editor initial, internal value for the field when the editor is ready.
         */
        setEditorInitialValue(editor) {
            this.value = this.field.value || ''
        },

        /**
         * Fill the given FormData object with the field's internal value.
         */
        fill(formData) {
            formData.append(this.field.attribute, this.value || '')
            formData.append(this.field.attribute + 'DraftId', this.draftId);
        },

        /**
         * Update the field's internal value.
         */
        handleChange(value) {
            this.value = value
        },

        /**
        * Create CKEditor upload adapter plugin.
        */
        createUploadAdapterPlugin(editor) {
            let novaConfig = editor.config.get('nova')

            editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                return new NovaCKEditor5UploadAdapter(loader, novaConfig.resourceName, novaConfig.field, novaConfig.draftId)
            }
        },

        /**
         * Purge pending attachments for the draft
         */
        cleanUp() {
            if (this.field.withFiles) {
                Nova.request()
                    .delete(
                        `/nova-vendor/ckeditor5-classic/${this.resourceName}/attachments/${this.field.attribute}/${this.draftId}`
                    )
                    .then(response => console.log(response))
                    .catch(error => {})
            }
        }

    }
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
}
</script>
