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
                // console.log("comments START:", comments);
                var remain = [...comments];
                var parents = [];
                var i, j, k;
                var temp = [];
                var indent = 0;

                // filtering root elements with empty response_to
                for (i = 0; i < remain.length; i++) {
                    if (remain[i].response_to < 1) {
                        remain[i].indent = indent + "px";
                        parents.push(remain[i]);
                        remain.splice(i, 1);
                        i--;
                    } 
                } 
                console.log("after first run of Array size:", comments.length);
                console.log("base elements:", parents.length);
                console.log("sub elements:", remain.length);
                // compare all parents and find the connected element and include after.
                while (remain.length > 0) {
                    indent += 15;
                    for (i = 0; i < parents.length; i++) {
                        k = i;
                        for (j = 0; j < remain.length; j++) {
                            if (parents[i].id == remain[j].response_to) {
                                remain[j].indent = indent + "px";
                                // parents.splice(i + 1, 0, remain[j]);
                                temp.push(remain[j]);
                                // parents.splice(k+1, 0, remain[j]);
                                // k++;
                                remain.splice(j, 1);
                                j--;
                            }
                        }
                    }
                }
                
                // now I have all Elements on the current level, only responses left in comments
                // next step is to find the element place each element after the parent
                // I take the first parent and look in the remainings for the match on response. if so, then place element after parent

                // while (comments.length > 0) {
                //     console.log("length:", comments.length);
                //     for (i = 0; i < parents.length; i++) {
                //         for (j = 0; j < comments.length; j++) {
                //             if (parents[i].id == comments[j].response_to) {
                //                 comments[j].indent = parents[i].indent + 1;
                //                 parents.splice(i + 1, 0, comments.splice(j, 1));
                //                 j--;
                //                 i++;
                //             }
                //         }
                //     }
                // }
                console.log("comments answers", remain);
                console.log("comments Parent", parents);
                return parents;
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
                        console.log(
                            "we received the following comments:",
                            details.data
                        );
                        // self.comments = details.data;
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
                // console.log("writing comment now with:", commentObj);
                axios
                    .post("/comment", commentObj)
                    .then(function (result) {
                        self.loadComments();
                        // commentObj.id = result.data.id;
                        // commentObj.created_at = result.data.created_at;
                        // self.comments.unshift(commentObj);
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
                    // id: "",
                    description: "",
                    title: "",
                    url: "",
                    username: "",
                    created_at: "",
                    younger: "",
                    older: ",",
                },
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
                        // console.log("SQL details for new modal:", details);
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
                // this.$emit("left-modal");
                if (this.image.older) {
                    // this.imageid = this.image.older;
                    window.location.hash = "#" + this.image.older;
                    this.$emit("change-modal", this.image.older);
                }
            },
            rightModal: function () {
                if (this.image.younger) {
                    // this.imageid = this.image.younger;
                    window.location.hash = "#" + this.image.younger;
                    this.$emit("change-modal", this.image.younger);
                }
            },
            deleteImage: function () {
                console.log("firing a delete req for", this.imageid);
                this.$emit("remove-image", {
                    id: this.imageid,
                    url: this.image.url,
                });
                // this.$emit("close-modal");
            },
        },
    });

    // handle unknown ID with hash-start
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
            modalId: window.location.hash.slice(1),
            totalImages: 0,
            lastDisplayedId: 0,
            distanceToLastId: 0,
            locked: true,
            file: null,
        }, // data ends
        mounted: function () {
            // console.log("hash:", window.location.hash.slice(1));
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
                window.location.hash = "";
                this.modalId = 0;
                window.history.replaceState({}, "", "/");
            },
            changeModal: function (newId) {
                // console.log("received the new ID", newId);
                this.modalId = newId;
            },
            removeImage: function (obj) {
                this.closeModal();
                var self = this;
                axios
                    .post("/delete", obj)
                    .then(function (result) {
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

/*
form validation finish! double messages dont work
Pflichtfelder
show sum of pictures (maybe with new ones...)

show error message in specific cases

*/
