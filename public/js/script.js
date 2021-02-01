(function () {
    new Vue({
        el: "#main", // reference to HTML container
        data: {
            sectionName: "Latest Images",
            seen: false,
            images: [],
            username: "",
            description: "",
            title: "",
            msg: "...",
            locked: false,
            file: null,
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
        },
        methods: {
            fileSelect: function (e) {
                this.file = e.target.files[0];
                // console.log(e.target.files[0].size);
                if (e.target.files[0].size > 2097152) {
                    this.locked = true;
                    this.msg = "selected file size too large (max. 2 MB)";
                } else {
                    this.msg = "...";
                    this.locked = false;
                }
            },
            checkFields: function (e) {
                console.log(e);
                console.dir(e);
                if (e.target.value === "") {
                    e.target.style.borderBottom = "5px solid red";
                } else {
                    e.target.style.borderBottom = "5px solid green";
                }
            },
            uploadHandler: function () {
                this.locked = true;

                var selectedImage = new FormData();
                selectedImage.append("title", this.title);
                selectedImage.append("description", this.description);
                selectedImage.append("username", this.username);
                selectedImage.append("file", this.file);

                this.username = "";
                this.title = "";
                this.description = "";

                var self = this;
                axios
                    .post("/upload", selectedImage)
                    .then(function (result) {
                        console.log("result object:", result.data);
                        // console.log("result from axios.post:", result);
                        // console.log("this inside axios.post:", self);
                        self.images.unshift(result.data);
                        self.locked = false;
                    })
                    .catch(function (err) {
                        console.log("ERR in axios.post:", err);
                    });
            },
        },
    });
})();

/*
form validation finish!
:disabled="buttondisabled"
Pflichtfelder
disable button when loading
disable button on other unfitting cases

show error message in specific cases

*/
