function contentlifyMarkDownToHtmlString(markdown) {
    return new showdown.Converter().makeHtml(markdown);
}

var contentlifyLoadingRenderLock = 0;

var contentfulClientLive = contentful.createClient({
    space: "1mv2u22omsld",
    accessToken: "899769f9000215ba2d755e43bb5c4e525282c18553ec28b6faccf820f7a38258"
});

var contentfulClientPreview = contentful.createClient({
    space: "1mv2u22omsld",
    accessToken: "93a721fc09d37876ff1ef30c4af0f28dfb2dfc7e5d30c799c28e175a1c4c08fe",
    host: "preview.contentful.com"
});

var contentfulClient = contentfulClientLive;

var contentLifyOriginalScrollTo;
function contentlifyScrollTo(x, y) {
    window.scrollTo = contentLifyOriginalScrollTo;
    zenscroll.toY(y);
}

var contentlifyRouter = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/:entryCode/:localeCode?/:pageCode?/:anchorTick?'
        }
    ],
    scrollBehavior: function(to, from, savedPosition) {
        if (to.hash) {
            // replace one window.scrollTo call to call zenscroll
            contentLifyOriginalScrollTo = window.scrollTo;
            window.scrollTo = contentlifyScrollTo;

            return { selector: to.hash };
        }
    }
});

var contentlifyRichTextOptions = {
    renderNode: {
        'embedded-asset-block': function (_ref) {
            var fields = _ref.data.target.fields;
            var img = document.createElement('img');
            img.setAttribute('src', fields.file.url);
            img.setAttribute('width', fields.file.details.image.width);
            img.setAttribute('width', fields.file.details.image.width);
            img.setAttribute('height', fields.file.details.image.height);

            if (fields.title) {
                img.setAttribute('title', fields.title);
            }

            if (fields.description) {
                img.setAttribute('alt', fields.description);
            }

            var str = img.outerHTML;
            str = str.substring(0, str.length - 1) + "/>";

            return str;
        }
    }
};

function contentlifyContentLoaded(data) {
    contentlifyLoadingRenderLock++;

    for (var f in data.fields) {
        if (data.fields[f].nodeType === "document") {
            data.fields[f] = documentToHtmlString(data.fields[f], contentlifyRichTextOptions);
        } else if (typeof (data.fields[f]) === "string" && (data.fields[f].indexOf('\r') > -1 || data.fields[f].indexOf('\n') > -1)) {
            data.fields[f] = contentlifyMarkDownToHtmlString(data.fields[f]);
        }
    }

    contentlifyViewModel.pageCode = contentlifyViewModel.pageCode;
    contentlifyViewModel.showDiagnostics = true;
    contentlifyViewModel.errorDetails = {};
    contentlifyViewModel.content = data.fields;
    contentlifyViewModel.loading = false;
    contentlifyViewModel.error = false;
    contentlifyViewModel.errorCount = 0;

    if (typeof (window.contentlifyStyleOverrides) === 'function') {
        contentlifyViewModel.styles = window.contentlifyStyleOverrides(data.fields);
    }

    if (typeof(window.contentlifyUpdateCallback) === 'function') {
        window.contentlifyUpdateCallback();
    }

    if (typeof (window.contentlifyNavigationCallback) === 'function') {
        window.contentlifyNavigationCallback();
    }
}

function contentlifyContentLoadError(error) {
    contentlifyViewModel.error = true;
    contentlifyViewModel.errorCount++;
    contentlifyViewModel.errorDetails = error;
    if (error.response && error.response.data && typeof (error.response.data.message) === "string") {
        contentlifyViewModel.errorMessage = error.response.data.message;
    } else {
        contentlifyViewModel.errorMessage = "Unexpected / unknown error.";
    }
    if (contentlifyViewModel.errorCount < 10) {
        setTimeout(contentlifyLoadContent, 3000);
    } else {
        contentlifyViewModel.willTryErrorAgain = false;
    }
}

function contentlifyShowLoadingOnSlowNetworksAfterMs(delay) {
    var rlock = contentlifyLoadingRenderLock;
    setTimeout(function () {
        if (rlock === contentlifyLoadingRenderLock) {
            contentlifyViewModel.loading = true;
        }
    }, delay);
}

function contentlifyLoadContent() {
    contentlifyShowLoadingOnSlowNetworksAfterMs(1500);

    var client = contentlifyViewModel.previewMode ? contentfulClientPreview : contentfulClientLive;

    client.getEntries({
            content_type: contentlifyEntityType,
            locale: contentlifyViewModel.localeCode,
            'fields.slug[in]': contentlifyViewModel.entryCode
        })
        .then(function (data) {
            if (data.items && data.items.length > 0) {
                contentlifyContentLoaded(data.items[0]);
            } else {
                contentlifyContentLoadError({ response: { data: { message: "Content not found: " + contentlifyEntityType + " / " + contentlifyViewModel.entryCode, entries: data } } });
            }
        }, contentlifyContentLoadError);
}

function contentlifyInit() {
    contentlifyViewModel = new Vue({
        el: '#app',
        router: contentlifyRouter,
        watch: {
            '$route': 'reloadContentOrRoute',
            'previewMode': 'previewModeUpdate'
        },
        methods: {
            previewModeUpdate: function() {
                contentlifyLoadContent();
            },
            reloadContentOrRoute: function () {
                var old_entryCode = this.entryCode;
                var old_localeCode = this.localeCode;
                this.entryCode = this.$route.params.entryCode;
                this.localeCode = this.$route.params.localeCode;
                this.pageCode = this.$route.params.pageCode;
                this.anchorTick++;
                //this.anchor = this.$route.params.anchor;

                // only company code and locale would trigger reload of content
                if (!(old_entryCode == this.entryCode && old_localeCode == this.localeCode)) {
                    contentlifyLoadContent();
                }
                else if (typeof (window.contentlifyNavigationCallback) === 'function') {
                    window.contentlifyNavigationCallback();
                }
            },
            anchorLink: function (page, anchor) {
                return '/' +
                    this.entryCode +
                    '/' +
                    (this.localeCode ? this.localeCode : 'en-US') +
                    '/' +
                    (page ? page : this.pageCode ? this.pageCode : 'Home') +
                    '/' +
                    this.anchorTick
                    + '#' + anchor;
            },
            pageLink: function (page) {
                return '/' +
                    this.entryCode +
                    '/' +
                    (this.localeCode ? this.localeCode : 'en-US') +
                    '/' +
                    (page ? page : this.pageCode ? this.pageCode : 'Home');
            }
        },
        data: {
            loading: true,
            error: false,
            showDiagnostics: false,
            errorMessage: "",
            entryCode: undefined,
            localeCode: undefined,
            pageCode: undefined,
            anchor: undefined,
            anchorTick: 0,
            errorDetails: {},
            errorCount: 0,
            willTryErrorAgain: true,
            content: {},
            locales: [],
            styles: '<style></style>',
            previewMode: false
        },
        computed: {
        }
    });

    contentlifyViewModel.reloadContentOrRoute();

    // TODO: this will be replaced with content entry specific locales (rather than global contentful ones)
    contentfulClient.getLocales().then(function (data) {
        data.items.push({ code: 'en-CA', name: 'English (Canada)' }); // TODO: delete this one line of demo code
        contentlifyViewModel.locales = data.items;
    }, function (error) {
        contentlifyViewModel.locales = [{ code: 'en-US', name: 'English' }];
    });

    // contentlifyLoadContent(localeCode);
}
