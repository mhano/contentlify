// TODO: support loading both a base set of template content and company specific overrides

function contentlifyMarkDownToHtmlString(markdown) {
    return new window.showdown.Converter().makeHtml(markdown);
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
    window.zenscroll.toY(y);
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

function contentlifyContentLoaded(results) {
    contentlifyLoadingRenderLock++;

    // collapse entry specific config over the top of generic template based config
    for (var i = 0; i < window.contentlifyEntityTypes.length; i++) {
        var data = results[window.contentlifyEntityTypes.length + i];

        for (var f in data.fields) {
            if (data.fields.hasOwnProperty(f)) {
                results[i].fields[f] = data.fields[f];
            }
        }
    }

    var content = {};
    // convert rich text and markdown to html
    for (var i = 0; i < window.contentlifyEntityTypes.length; i++) {
        var data = results[i];

        for (var f in data.fields) {
            if (data.fields.hasOwnProperty(f)) {
                if (data.fields[f].nodeType === "document") {
                    data.fields[f] = window.documentToHtmlString(data.fields[f], contentlifyRichTextOptions);
                } else if (typeof (data.fields[f]) === "string" &&
                    (data.fields[f].indexOf('\r') > -1 || data.fields[f].indexOf('\n') > -1)) {
                    data.fields[f] = contentlifyMarkDownToHtmlString(data.fields[f]);
                }
            }
        }

        content[window.contentlifyEntityTypes[i]] = data.fields;
    }

    contentlifyViewModel.pageCode = contentlifyViewModel.pageCode;
    contentlifyViewModel.showDiagnostics = true;
    contentlifyViewModel.errorDetails = {};
    contentlifyViewModel.content = content;
    contentlifyViewModel.loading = false;
    contentlifyViewModel.error = false;
    contentlifyViewModel.errorCount = 0;

    if (typeof (window.contentlifyStyleOverrides) === 'function') {
        contentlifyViewModel.styles = window.contentlifyStyleOverrides(content);
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
    if (contentlifyViewModel.errorCount < 3) {
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

function contentlifyPartialResultReceive() {

    
}

function contentlifyLoadContent() {
    contentlifyShowLoadingOnSlowNetworksAfterMs(1500);

    if (!(window.contentlifySlugField && window.contentlifyEntityTypes && window.contentlifyBaseTemplateSlug)) {
        console.error("contentlifySlugField, contentlifyEntityTypes and contentlifyBaseTemplateSlug need to be defined");
    };

    var client = contentlifyViewModel.previewMode ? contentfulClientPreview : contentfulClientLive;

    var promises = new Array(window.contentlifyEntityTypes.length * 2);

    for (var i = 0; i < window.contentlifyEntityTypes.length; i++) {
        var requestBase = {
            content_type: window.contentlifyEntityTypes[i],
            locale: contentlifyViewModel.localeCode
        };

        requestBase["fields." + window.contentlifySlugField + "[in]"] = window.contentlifyBaseTemplateSlug;

        promises[i] = client.getEntries(requestBase);
    }

    for (var i = 0; i < window.contentlifyEntityTypes.length; i++) {
        var request = {
            content_type: window.contentlifyEntityTypes[i],
            locale: contentlifyViewModel.localeCode
        };

        request["fields." + window.contentlifySlugField + "[in]"] = contentlifyViewModel.entryCode;

        promises[window.contentlifyEntityTypes.length + i] = client.getEntries(request);
    }

    Promise.all(promises).then(function (results) {
        var loadedContent = new Array(window.contentlifyEntityTypes.length);
        var errors = new Array();
        
        for (var i = 0; i < window.contentlifyEntityTypes.length; i++) {
            if (results[i].items && results[i].items.length > 0) {
                loadedContent[i] = results[i].items[0];
            } else {
                errors.push("Content type: " + window.contentlifyEntityTypes[i] + ", slug/entry code: " + window.contentlifyBaseTemplateSlug);
            }
        }

        for (var i = 0; i < window.contentlifyEntityTypes.length; i++) {
            if (results[window.contentlifyEntityTypes.length + i].items && results[window.contentlifyEntityTypes.length + i].items.length > 0) {
                loadedContent[window.contentlifyEntityTypes.length + i] = results[window.contentlifyEntityTypes.length + i].items[0];
            } else {
                errors.push("Content type: " + window.contentlifyEntityTypes[i] + ", slug/entry code: " + contentlifyViewModel.entryCode);
            }
        }

        if (errors.length > 0) {
            contentlifyContentLoadError({
                response: { data: { message: "Content not found: " + errors.join("\r\n"), results: results } }
            });
        } else {
            contentlifyContentLoaded(loadedContent);
        }
    }, contentlifyContentLoadError);
}

function contentlifyInit() {

    contentlifyViewModel = new Vue({
        el: '#app',
		components: { 'carousel': carousel },
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

                if (!(old_entryCode == this.entryCode && old_localeCode == this.localeCode)) {
                    contentlifyLoadContent();
                }
                else if (typeof (window.contentlifyNavigationCallback) === 'function') {
                    window.contentlifyNavigationCallback();
                }
            },
            anchorLink: function (page, anchor) {
                return '/' + this.entryCode + '/' +
                    (this.localeCode ? this.localeCode : 'en-US') + '/' +
                    (page ? page : this.pageCode ? this.pageCode : 'Home') + '/' +
                    this.anchorTick + '#' + anchor;
            },
            pageLink: function (page) {
                return '/' + this.entryCode + '/' +
                    (this.localeCode ? this.localeCode : 'en-US') + '/' +
                    (page ? page : this.pageCode ? this.pageCode : 'Home');
            },
			hamburgerClick: function(){
				this.hamburgerActive == false ? this.hamburgerActive = true : this.hamburgerActive = false;

			}
        },
        data: {
            loading: true, error: false, showDiagnostics: false, errorMessage: "", entryCode: undefined,
            localeCode: undefined, pageCode: undefined, anchor: undefined, anchorTick: 0, errorDetails: {},
            errorCount: 0, willTryErrorAgain: true, content: {}, locales: [], styles: '<style></style>',
            previewMode: false,
			
			hamburgerActive: false
        }
    });

    if (contentlifyViewModel.$route.query.preview) {
        contentlifyViewModel.previewMode = true;
    }

    contentlifyViewModel.reloadContentOrRoute();

    // TODO: this will be replaced with content entry specific locales (rather than global contentful ones)
    contentfulClient.getLocales().then(function (data) {
        data.items.push({ code: 'en-CA', name: 'English (Canada)' }); // TODO: delete this one line of demo code
        contentlifyViewModel.locales = data.items;
    }, function (error) {
        contentlifyViewModel.locales = [{ code: 'en-US', name: 'English' }];
    });
}
