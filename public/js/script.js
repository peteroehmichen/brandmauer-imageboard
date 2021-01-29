(function () {
    new Vue({
        el: "#main", // reference to HTML container
        data: {
            sectionName: "Latest Images",
            seen: false,
            images: [],
        }, // data ends
        mounted: function () {
            var self = this;
            axios
                .get("/images")
                .then(function (res) {
                    self.images = res.data;
                })
                .catch(function (err) {
                    console.log("error in fetching images:", err);
                });

            // alternative ES6 arrowFn in Axios or bind()
            // axios.get("/cities").then(function (response) {
            //     console.log("Vue Object: ", self);
            //     self.cities = response.data;
            // });
        }, // mounted ends
        methods: {
            myFunction: function () {
                console.log("myFunc is running...");
            },
        }, // methods ends
    });
})();
