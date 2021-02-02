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
            msg: "",
            locked: true,
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
                // console.log(e.target.files[0].size);
                if (e.target.files[0].size > 2097152) {
                    this.msg = "selected file size too large (max. 2 MB)";
                    this.file = null;
                } else {
                    this.msg = "";
                    this.file = e.target.files[0];
                }
                this.activateBtn();
            },
            checkFields: function (e) {
                if (e.target.value === "") {
                    e.target.style.borderBottom = "3px solid orangered";
                    // e.target.removeClass("ok");
                    // this.msg = "Field cannot be empty";
                } else {
                    var regex = /[&<>;]/;
                    // console.log(regex.test(e.target.value));
                    if (regex.test(e.target.value)) {
                        console.log("fire!");
                        e.target.style.borderBottom = "3px solid orangered";
                        this.msg = "text cannot include special characters";
                    } else {
                        this.msg = "";
                        e.target.style.borderBottom = "3px solid green";
                    }
                    // e.target.addClass("ok");
                    // this.msg = "";
                }
                this.activateBtn();
            },
            activateBtn: function () {
                if (
                    this.title != "" &&
                    this.description != "" &&
                    this.username != "" &&
                    this.file
                ) {
                    this.locked = false;
                } else {
                    this.locked = true;
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
