(function () {
    new Vue({
        el: "#main", // reference to HTML container
        data: {
            sectionName: "Latest Images",
            seen: false,
            images: [],
        }, // data ends
        mounted: function () {
            console.log(this);
            var self = this;
            axios
                .get("/images")
                .then(function (res) {
                    self.images = res.data;
                })
                .catch(function (err) {
                    console.log("error in fetching images:", err);
                });
        },
    });
})();
