<template>
    <div id="disqus_thread"></div>
</template>

<script>
export default {
    props: {
        pageUrl: {
            type: String,
            required: true
        },
        pageIdentifier: {
            type: String,
            required: true
        }
    },
    mounted() {
        if (process.client) {
            this.loadDisqus()
        }
    },
    methods: {
        loadDisqus() {
            var disqus_config = function () {
                this.page.url = this.pageUrl
                this.page.identifier = this.pageIdentifier
            }

                ; (function () {
                    var d = document, s = d.createElement('script')
                    s.src = 'https://dinor-app.disqus.com/embed.js'
                    s.setAttribute('data-timestamp', +new Date())
                        ; (d.head || d.body).appendChild(s)
                })()
        }
    }
}
</script>
<style scoped>
#disqus_thread {
    width: 100% !important;
    min-width: 100% !important;
    margin: 2rem 0;
    padding: 1rem;
}

/* Force Disqus iframe to take full width */
:deep(iframe) {
    width: 100% !important;
    min-width: 100% !important;
}
</style>