(function () {
    function format_time(created) {
        let timePassed = Date.now() - new Date(created);
        let minutes = timePassed / (1000 * 60);
        let hours = minutes / 60;
        if (hours >= 48) {
            timePassed = Math.floor(hours / 24);
            timePassed = timePassed + " days ago";
        } else if (hours > 24) {
            timePassed = Math.floor(hours - 24);
            timePassed = `1 day ago`;
        } else if (hours >= 1) {
            // more than 1 hour
            timePassed = Math.floor(hours);
            timePassed = timePassed + " hour/s ago";
        } else {
            if (minutes > 1) {
                timePassed = Math.floor(minutes) + " minute/s ago";
            } else {
                timePassed = "less than 1 minute ago";
            }
        }
        return timePassed;
    }

    Vue.component("comment-component", {
        template: "#comment-template",
        props: ["image"],
        mounted: function () {
            // console.log("reading comments now...");
            var self = this;
            axios
                .get(`/comments/${this.image}`)
                .then(function (details) {
                    // console.log("we received the following comments:", details);
                    self.comments = details.data;
                })
                .catch(function (err) {
                    console.log(
                        "There was an error while fetching comments:",
                        err
                    );
                });
        },
        data: function () {
            return {
                comment: "",
                username: "",
                comments: [],
                locked: true,
            };
        },
        methods: {
            format_time: format_time,
            checkFields: function (e) {
                if (e.target.value === "") {
                    e.target.style.borderBottom = "3px solid orangered";
                } else {
                    var regex = /[&<>;]/;
                    if (regex.test(e.target.value)) {
                        e.target.style.borderBottom = "3px solid orangered";
                    } else {
                        e.target.style.borderBottom = "3px solid green";
                    }
                }
                this.activateBtn();
            },
            activateBtn: function () {
                if (this.comment != "" && this.username != "") {
                    this.locked = false;
                } else {
                    this.locked = true;
                }

                // if (
                //     this.comment != "" &&
                //     this.username != "" &&
                //     // need to include the regex
                // ) {
                //     this.locked = false;
                // } else {
                //     this.locked = true;
                // }
            },
            writeComment: function () {
                var self = this;
                var commentObj = {
                    comment: this.comment,
                    username: this.username,
                    imageId: this.image,
                };
                // console.log("writing comment now with:", commentObj);
                axios
                    .post("/comment", commentObj)
                    .then(function (result) {
                        commentObj.id = result.data.id;
                        commentObj.created_at = result.data.created_at;
                        self.comments.push(commentObj);
                        self.comment = "";
                        self.username = "";
                        // console.log(formattime(result.data.created_at));
                    })
                    .catch(function (err) {});
                // axios.post("/comment", commentObj).then(function (result) {
                //     console.log("received obj after wirting comment:", result);
                // }.catch(function (err) {
                //     console.log("error in return obj after writing comment:", err);
                // });
            },
        },
    });

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
            var self = this;
            axios
                .get(`/details/${this.imageid}`)
                .then(function (details) {
                    // console.log("Picture details from SQL:", details.data);
                    self.image = details.data;
                    // let time = Date.now() - new Date(self.image.created_at);
                    // let hours = time / (1000 * 60 * 60);
                    // if (hours >= 48) {
                    //     // 2 days or more
                    //     time = Math.floor(hours / 24);
                    //     time = time + " days ago";
                    // } else if (hours >= 24) {
                    //     time = Math.floor(hours - 24);
                    //     time = `1 day and ${time} hour(s) ago`;
                    // } else if (hours >= 1) {
                    //     // more than 1 hour
                    //     time = Math.floor(hours);
                    //     time = time + " hours ago";
                    // } else {
                    //     time = "less than 1 hour ago";
                    // }
                    // self.image.created_at = time;
                })
                .catch(function (err) {
                    console.log("Error in getting image details:", err);
                });
        },
        methods: {
            format_time: format_time,
            closeModal: function () {
                this.$emit("close-modal");
            },
            leftModal: function () {
                this.$emit("left-modal");
            },
            rightModal: function () {
                this.$emit("right-modal");
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
            totalImages: 0,
            lastDisplayedId: 0,
            distanceToLastId: 0,
            locked: true,
            file: null,
        }, // data ends
        mounted: function () {
            this.loadImages();
        },
        methods: {
            loadImages: function () {
                var self = this;
                axios
                    .get(`/images/${self.lastDisplayedId}`)
                    .then(function (res) {
                        // console.log(res.data);
                        self.images = self.images.concat(res.data);
                        self.lastDisplayedId = res.data[res.data.length - 1].id;
                        self.distanceToLastId =
                            self.lastDisplayedId - res.data[0].lowest_id;
                        self.totalImages = res.data[0].total;
                    })
                    .catch(function (err) {
                        console.log("error in fetching images:", err);
                    });
            },
            fileSelect: function (e) {
                // console.log(e.target.files[0].size);
                if (e.target.files[0].size > 2097152) {
                    // this.msg = "selected file size too large (max. 2 MB)";
                    this.file = null;
                    this.filename = "max. 2 MB";
                    e.target.labels[0].style.borderBottom =
                        "3px solid orangered";
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
                // console.log(this.modalId);
                this.modalId = 0;
            },
            leftModal: function () {
                // console.log("closing the modal now...");
                // console.log(this.modalId);
                for (var i = 0; i < this.images.length; i++) {
                    if (this.images[i].id == this.modalId) {
                        // console.log("current picture is at position", i);
                        if (i != this.images.length - 1) {
                            this.modalId = 0;
                            var self = this;

                            setTimeout(function () {
                                self.modalId = self.images[i + 1].id;
                            }, 300);
                        }
                        break;
                    }
                }
                // console.log(this.modalId);
            },
            rightModal: function () {
                // console.log("closing the modal now...");
                // console.log(this.modalId);
                for (var i = 0; i < this.images.length; i++) {
                    if (this.images[i].id == this.modalId) {
                        // console.log("current picture is at position", i);
                        if (i != 0) {
                            this.modalId = 0;
                            var self = this;
                            setTimeout(function () {
                                self.modalId = self.images[i - 1].id;
                            }, 300);
                        }
                        break;
                    }
                }
                // console.log(this.modalId);
            },
        },
    });
})();

/*
form validation finish! double messages dont work
Pflichtfelder
show sum of pictures (maybe with new ones...)

show error message in specific cases

*/
