(function () {
    Vue.component("modal-component", {
        data: function () {
            return {
                image: {
                    // id: "",
                    description: "",
                    title: "",
                    url: "",
                    username: "",
                    created_at: "",
                },
            };
        },
        template: "#modal-template",
        props: ["imageid"],
        mounted: function () {
            axios
                .get(`/details/${this.imageid}`)
                .then((details) => {
                    // console.log("Picture details from SQL:", details.data);
                    this.image = details.data;
                    let time = Date.now() - new Date(this.image.created_at);
                    let hours = time / (1000 * 60 * 60);
                    if (hours >= 48) {
                        // 2 days or more
                        time = Math.floor(hours / 24);
                        time = time + " days ago";
                    } else if (hours >= 24) {
                        time = Math.floor(hours - 24);
                        time = `1 day and ${time} hour(s) ago`;
                    } else if (hours >= 1) {
                        // more than 1 hour
                        time = Math.floor(hours);
                        time = time + " hours ago";
                    } else {
                        time = "less than 1 hour ago";
                    }
                    this.image.created_at = time;
                })
                .catch((err) => {
                    console.log("Error in getting image details:", err);
                });
        },
        methods: {
            closeModal: function () {
                // console.log("requesting to close...");
                this.$emit("close-modal");
            },
        },
    });

    new Vue({
        el: "#main", // reference to HTML container
        data: {
            sectionName: "Latest Images",
            images: [],
            username: "",
            description: "",
            title: "",
            // msg: "",
            filename: "Choose image",
            modalId: 0,
            locked: true,
            file: null,
        }, // data ends
        mounted: function () {
            var self = this;
            axios
                .get("/images")
                .then(function (res) {
                    // console.log("start-array:", res.data);
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
                    // this.msg = "selected file size too large (max. 2 MB)";
                    this.file = null;
                    this.filename = "max. 2 MB";
                    e.target.labels[0].style.borderBottom = "3px solid orangered";
                } else {
                    // this.msg = "";
                    this.file = e.target.files[0];
                    // console.log("selected:", e);
                    this.filename = e.target.files[0].name;
                    e.target.labels[0].style.borderBottom = "3px solid green";
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
                        e.target.style.borderBottom = "3px solid orangered";
                        // this.msg = "text cannot include special characters";
                    } else {
                        // this.msg = "";
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
                    // need to include the regex
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
                this.filename = "Choose image";

                var self = this;
                axios
                    .post("/upload", selectedImage)
                    .then(function (result) {
                        // console.log("result object:", result.data);
                        // console.log("result from axios.post:", result);
                        // console.log("this inside axios.post:", self);
                        self.images.unshift(result.data);
                    })
                    .catch(function (err) {
                        console.log("ERR in axios.post:", err);
                    });
            },
            openModal: function (id) {
                this.modalId = id;
            },
            closeModal: function () {
                // console.log("closing the modal now...");
                this.modalId = 0;
            },
        },
    });
})();

/*
form validation finish! double messages dont work
Pflichtfelder
disable button when loading
disable button on other unfitting cases

show error message in specific cases

*/
