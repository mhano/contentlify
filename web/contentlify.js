function contentlifyMarkDownToHtmlString(markdown) {
    return new showdown.Converter().makeHtml(markdown);
}

var contentlifyLoadingRenderLock = 0;

var contentlifyRouter = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/:entryCode/:localeCode?/:pageCode?/:anchorTick?'
        }
    ],
    scrollBehavior: function(to, from, savedPosition) {
        if (to.hash) {
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
            img.setAttribute('title', fields.title);
            img.setAttribute('alt', fields.description);
            var str = img.outerHTML;
            img = undefined;

            return str; /* "<img src=\"" + fields.file.url +
                "\" height=\"" + fields.file.details.image.height +
                "\" width=\"" + fields.file.details.image.width +
                "\" title=\"" + fields.title +
                "\" alt=\"" + fields.description + "\"/>"; */
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

    contentlifyViewModel.styles = contentlifyStyleOverrides(data.fields);
    contentlifyViewModel.pageCode = contentlifyViewModel.pageCode;
    contentlifyViewModel.showDiagnostics = true;
    contentlifyViewModel.errorDetails = {};
    contentlifyViewModel.content = data.fields;
    contentlifyViewModel.loading = false;
    contentlifyViewModel.error = false;
    contentlifyViewModel.errorCount = 0;
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

    contentfulClient.getEntries({
            content_type: contentlifyEntityType,
            locale: contentlifyViewModel.localeCode,
            'fields.slug[in]': contentlifyViewModel.entryCode
        })
        .then(function (data) {
            if (data.items && data.items.length > 0) {
                contentlifyContentLoaded(data.items[0]);
            } else {
                contentlifyContentLoadError({ response: { data: { message: "Content not found: " + entryType + " / " + contentlifyViewModel.entryCode, entries: data } } });
            }
        }, contentlifyContentLoadError);
}

function contentlifyInit() {
    contentlifyViewModel = new Vue({
        el: '#app',
        router: contentlifyRouter,
        watch: {
            '$route': 'fetchData'
        },
        methods: {
            fetchData: function () {
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
            styles: '<style></style>'
        },
        computed: {
        }
    });

    contentlifyViewModel.fetchData();

    // TODO: this will be replaced with content entry specific locales (rather than global contentful ones)
    contentfulClient.getLocales().then(function (data) {
        data.items.push({ code: 'en-CA', name: 'English (Canada)' }); // TODO: delete this one line of demo code
        contentlifyViewModel.locales = data.items;
    }, function (error) {
        contentlifyViewModel.locales = [{ code: 'en-US', name: 'English' }];
    });

    // contentlifyLoadContent(localeCode);
}
