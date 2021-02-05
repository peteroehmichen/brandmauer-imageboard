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
            this.loadComments();
        },
        data: function () {
            return {
                comment: "",
                username: "",
                comments: [],
                locked: true,
                replyId: "",
                replyName: "",
            };
        },
        watch: {
            image: function () {
                this.loadComments();
            },
        },
        methods: {
            analyseComments: function (comments) {
                var startArray = comments.slice();
                var endArray = [];
                var i, j;
                var temp;
                var indent = 0;
                for (i = 0; i < startArray.length; i++) {
                    if (startArray[i].response_to == 0) {
                        startArray[i].indent = indent;
                        endArray.push(startArray[i]);
                        startArray.splice(i, 1);
                        i--;
                    }
                }
                while (startArray.length > 0) {
                    indent += 15;

                    for (i = 0; i < endArray.length; i++) {
                        for (j = 0; j < startArray.length; j++) {
                            if (
                                endArray[i].indent == indent - 15 &&
                                endArray[i].id == startArray[j].response_to
                            ) {
                                startArray[j].indent = indent;
                                temp = startArray[j];
                                startArray.splice(j, 1);
                                j--;
                                endArray.splice(i + 1, 0, temp);
                            }
                        }
                    }
                }
                return endArray;
            },
            loadComments: function () {
                this.replyId = 0;
                this.replyName = "";
                this.comment = "";
                this.username = "";
                var self = this;
                axios
                    .get(`/comments/${this.image}`)
                    .then(function (details) {
                        self.comments = self.analyseComments(details.data);
                    })
                    .catch(function (err) {
                        console.log(
                            "There was an error while fetching comments:",
                            err
                        );
                    });
            },
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
            },
            writeComment: function () {
                var self = this;
                var commentObj = {
                    comment: this.comment,
                    username: this.username,
                    imageId: this.image,
                    response_to: this.replyId,
                };
                axios
                    .post("/comment", commentObj)
                    .then(function (result) {
                        self.loadComments();
                        self.comment = "";
                        self.username = "";
                        self.replyName = "";
                        self.replyId = 0;
                    })
                    .catch(function (err) {
                        console.log(
                            "error in return obj after writing comment:",
                            err
                        );
                    });
            },
            parentComment: function (user, id) {
                if (this.replyId != id) {
                    this.replyId = id;
                    this.replyName = user;
                } else {
                    this.replyId = 0;
                    this.replyName = "";
                }
            },
        },
    });

    Vue.component("modal-component", {
        data: function () {
            return {
                image: {
                    description: "",
                    title: "",
                    url: "",
                    username: "",
                    created_at: "",
                    younger: "",
                    older: "",
                },
                confirmDelete: false,
            };
        },
        template: "#modal-template",
        props: ["imageid"],
        mounted: function () {
            this.loadModal();
        },
        watch: {
            imageid: function () {
                this.loadModal();
            },
        },
        methods: {
            format_time: format_time,
            loadModal: function () {
                var self = this;
                axios
                    .get(`/details/${this.imageid}`)
                    .then(function (details) {
                        if (details.data.err) {
                            self.$emit("close-modal");
                        } else {
                            self.image = details.data;
                        }
                    })
                    .catch(function (err) {
                        console.log("Error in getting image details:", err);
                        self.$emit("close-modal");
                    });
            },
            closeModal: function () {
                this.$emit("close-modal");
            },
            leftModal: function () {
                if (this.image.older) {
                    window.location.hash = "#" + this.image.older;
                    this.$emit("change-modal", this.image.older);
                }
            },
            rightModal: function () {
                if (this.image.younger) {
                    window.location.hash = "#" + this.image.younger;
                    this.$emit("change-modal", this.image.younger);
                }
            },
            precheckDeleteImage: function () {
                console.log("precheck");
                this.confirmDelete = true;
            },
            deleteImage: function () {
                if (this.confirmDelete) {
                    this.confirmDelete = false;
                    this.$emit("remove-image", {
                        id: this.imageid,
                        url: this.image.url,
                    });
                    this.$emit("close-modal");
                } else {
                    this.confirmDelete = true;
                }
                
            },
        },
    });

    new Vue({
        el: "#main", 
        data: {
            sectionName: "Latest Images",
            images: [],
            username: "",
            description: "",
            title: "",
            filename: "Choose image",
            modalId: window.location.hash.slice(1),
            totalImages: 0,
            lastDisplayedId: 0,
            distanceToLastId: 0,
            locked: true,
            file: null,
        }, 
        mounted: function () {
            this.loadImages();
            var self = this;
            addEventListener("hashchange", function () {
                self.modalId = window.location.hash.slice(1);
            });
        },
        methods: {
            loadImages: function () {
                var self = this;
                axios
                    .get(`/images/${self.lastDisplayedId}`)
                    .then(function (res) {
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
                if (e.target.files[0].size > 2097152) {
                    this.file = null;
                    this.filename = "max. 2 MB";
                    e.target.labels[0].style.borderBottom =
                        "3px solid orangered";
                } else {
                    this.file = e.target.files[0];
                    this.filename = e.target.files[0].name;
                    e.target.labels[0].style.borderBottom = "3px solid green";
                }
                this.activateBtn();
            },
            testFn: function (e) {
                console.log("test runs...");
                e.target.style.borderBottom = "3px solid orangered";
            },
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
                this.filename = "Choose image";

                var self = this;
                axios
                    .post("/upload", selectedImage)
                    .then(function (result) {
                        self.images.unshift(result.data);
                        self.totalImages++;
                    })
                    .catch(function (err) {
                        console.log("ERR in axios.post:", err);
                    });
            },
            openModal: function (id) {
                this.modalId = id;
            },
            closeModal: function () {
                window.location.hash = "";
                this.modalId = 0;
                window.history.replaceState({}, "", "/");
            },
            changeModal: function (newId) {
                this.modalId = newId;
            },
            removeImage: function (obj) {
                this.closeModal();
                var self = this;
                axios
                    .post("/delete", obj)
                    .then(function () {
                        self.totalImages--;
                        for (var i = 0; self.images.length; i++) {
                            if (self.images[i].id == obj.id) {
                                self.images.splice(i, 1);
                                break;
                            }
                        }
                    })
                    .catch(function (err) {
                        console.log(("Error after finished deletion:", err));
                    });
            },
        },
    });
})();

