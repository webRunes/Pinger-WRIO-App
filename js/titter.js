/**
 * titter related stuff
 */


define(['react', 'showdown', 'jquery'], function(React) {

    var Alert = React.createClass({displayName: "Alert",
        getInitialState: function() {
            return {
                text1: 'You\'ve donated 10 WRG. The author received 82%, which amounts to 8.2 WRG or 0.19 USD. Thank you!',
                text2: 'More information on donations and percentage you can find ',
                link: {
                    text: 'here',
                    url: '#'
                }
            };
        },
        render: function () {
            return (
                React.createElement("div", {className: "alert alert-success"}, 
                    React.createElement("button", {type: "button", className: "close", "data-dismiss": "alert"}, "×"), 
                    this.state.text1, React.createElement("br", null), this.state.text2, React.createElement("a", {href: this.state.link.url}, this.state.link.text)
                )
            );
        }
    });

    var CurrentBalance = React.createClass({displayName: "CurrentBalance",
        getInitialState: function() {
            return {
                text: 'Current balance\u00A0',
                cur1: 'WRG',
                value1: '\u00A019 135',
                cur2: 'USD',
                value2: 76.54,
                link: {
                    text: 'Add funds',
                    url: 'webgold-add_funds.htm'
                }
            };
        },
        render: function () {
            return (
                React.createElement("ul", {className: "leaders"}, 
                    React.createElement("li", null, 
                        React.createElement("span", null, this.state.text), 
                        React.createElement("span", null, this.state.value1, React.createElement("small", {className: "currency"}, this.state.cur1), React.createElement("sup", {className: "currency"}, this.state.value2, React.createElement("span", {className: "currency"}, this.state.cur2), '\u00b7', React.createElement("a", {href: this.state.link.url}, this.state.link.text)))
                    )
                )
            );
        }
    });

    var InputNumber = React.createClass({displayName: "InputNumber",
        getInitialState: function() {
            return {
                cur: 'WRG',
                value: 0,
                per: '82%',
                hint: 'The author will receive 82%, which amounts to 8.2 WRG or 0.19 USD. The bigger the donated amount, the bigger the received percentage up to 95%',
                text: 'Insufficient funds. ',
                link: {
                    text: 'Add funds',
                    url: 'webgold-add_funds.htm'
                }
            };
        },
        render: function() {
            return (
                React.createElement("div", {className: "form-group col-xs-12 col-md-4 col-lg-3 has-error"}, 
                    React.createElement("div", {className: "input-group input-group-sm tooltip-demo"}, 
                        React.createElement("span", {className: "input-group-addon"}, this.state.cur), 
                        React.createElement("input", {type: "number", className: "form-control", id: "inputAmount", value: this.state.value, min: "0"}), 
                        React.createElement("span", {className: "input-group-addon", "data-toggle": "tooltip", "data-placement": "top", title: this.state.hint}, this.state.per)
                    ), 
                    React.createElement("div", {className: "help-block"}, this.state.text, React.createElement("a", {href: this.state.link.url}, this.state.link.text))
                )
            );
        }
    });
    
    var TweetTitle = React.createClass({displayName: "TweetTitle",
        getInitialState: function() {
            var limit = 72;
            return {
                limit: limit,
                placeholder: 'Title, hashtags or mentions. Max ' + limit + ' characters',
                help: 'Max ' + limit + ' characters'
            };
        },
        render: function() {
            return (
                React.createElement("div", {className: "form-group col-xs-12 col-md-4 col-lg-7 has-error"}, 
                    React.createElement("div", {className: "input-group input-group-sm"}, 
                        React.createElement("span", {className: "input-group-addon twitter-limit"}, this.state.limit), 
                        React.createElement("input", {id: "IDtweet_title", name: "tweet_title", className: "form-control", maxlength: this.state.limit, placeholder: this.state.placeholder, type: "text"})
                    ), 
                    React.createElement("div", {className: "help-block"}, this.state.help)
                )
            );
        }
    });

    var LetUsKnow = React.createClass({displayName: "LetUsKnow",
        getInitialState: function() {
            var limit = 4096;
            return {
                placeholder: 'Let us know your thoughts! Max ' + limit + ' characters',
                help: 'Max ' + limit + ' characters'
            };
        },
        render: function() {
            return null
            return (
                React.createElement("div", {className: "form-group col-xs-12 has-error"}, 
                    React.createElement("textarea", {rows: "3", className: "form-control", placeholder: this.state.placeholder}), 
                    React.createElement("div", {className: "help-block"}, this.state.help)
                )
            );
        }
    });

    var Photo = React.createClass({displayName: "Photo",
        getInitialState: function() {
            return {
                text: 'Photo',
            };
        },
        render: function() {
            return null;
            return (
                React.createElement("div", {className: "btn-group tooltip-demo"}, 
                    React.createElement("button", {type: "button", className: "btn btn-default"}, React.createElement("span", {className: "glyphicon glyphicon-camera"}), this.state.text)
                )
            );
        }
    });
    
    var Submit = React.createClass({displayName: "Submit",
        getInitialState: function() {
            return {
                label: 4096,
                text: 'Login and submit'
            };
        },
        render: function() {
            return null;
            return (
                React.createElement("div", {className: "pull-right"}, 
                    React.createElement("div", {className: "pull-right"}, 
                        React.createElement("label", {className: "comment-limit"}, this.state.label), 
                        React.createElement("button", {type: "button", className: "btn btn-primary"}, React.createElement("span", {className: "glyphicon glyphicon-ok"}), this.state.text)
                    )
                )
            );
        }
    });

    var Donatate = React.createClass({displayName: "Donatate",
        getInitialState: function() {
            return {
                title: 'Donation'
            };
        },
        render: function () {
            return (
                React.createElement("form", {className: "margin-bottom", role: "form"}, 
                    React.createElement("div", {className: "form-group"}, 
                        React.createElement(Alert, null), 
                        React.createElement(CurrentBalance, null)
                    ), 
                    React.createElement("div", {className: "form-horizontal"}, 
                        React.createElement("div", {className: "form-group col-xs-12 col-md-4 col-lg-2"}, 
                            React.createElement("label", {className: "col-sm-2 control-label", for: "inputAmount"}, this.state.title)
                        ), 
                        React.createElement(InputNumber, null), 
                        React.createElement(TweetTitle, null)
                    ), 
                    React.createElement(LetUsKnow, null), 
                    React.createElement("div", {className: "form-group col-xs-12"}, 
                        React.createElement(Photo, null), 
                        React.createElement(Submit, null)
                    )
                )
            );
        }
    });

    var CreateTitter = React.createClass({displayName: "CreateTitter",
        createTwitterWidget: function (commentId) {
            window.onTimelineLoad = function () {
                console.log("Processing triggers when timeline loaded");
                $twitter = $('#twitter-widget-0').contents();
                function autoSizeTimeline() {
                    var twitterht = $twitter.find('.h-feed').height();
                    console.log("Setting height "+twitterht);
                    $('#twitter-widget-0').height((twitterht+100)+'px');
                }


                var prevHeight = $twitter.find('.h-feed').height();
                $(window).resize(function () {
                    autoSizeTimeline();
                });

                $twitter.find('style').html($('#twitter-widget-0').contents().find('style').html() + "img.autosized-media {width:auto;height:auto;}");
                setTimeout(autoSizeTimeline,1000);
            };
            var twheight = 10000;
            $('#titteriframe').height("190px");

            var twitter_template = '<a className="twitter-timeline" href="https://twitter.com/search?q=' + window.location.href + '" data-widget-id="' + commentId + '" width="' + $(window).width() + '" height="'+twheight+'" data-chrome="nofooter">Tweets about ' + window.location.href + '</a>'
            $('#titter_frame_container').append(twitter_template);

            !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
            if(!d.getElementById(id)){js=d.createElement(s);js.id=id;
            js.src=p+"://platform.twitter.com/widgets.js";
            js.setAttribute('onload', "twttr.events.bind('rendered',onTimelineLoad;");
            fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
        },
        isArticle: function(json) {
            var i;
            for (i = 0; i < json.length; i += 1) {
                comment = json[i];
                if(comment['@type'] === 'Article') {
                    return true;
                }
                var hasPart = comment.hasPart;
                if ((typeof hasPart === 'object') && (hasPart.length > 0)) {
                    return isArticle(hasPart);
                }
            }
        },
        loadTwittCommentsFromServer: function () {
            var that = this;
            if (this.isArticle(this.props.scripts)) {
                this.setState({data: data});
            }

            $("#titteriframe").on('load', function (event) {
                console.log("Iframe loaded");
                var CommendId = function () {
                    return getFinalJSON(that.props.scripts);
                };
                var getFinalJSON = function (json, hasPart) {
                    for (var j = 0; j < json.length; j++) {
                        comment = json[j];
                        var commentid = comment['comment'];
                        if (commentid) {
                            return commentid;
                        }
                    }
                    ;
                    return null;
                };
                var w = this.contentWindow;
                var data = {
                    url: window.location.href
                };
                var id = CommendId();
                if (id == null) {
                    that.setState({nocomments: true});
                } else {
                    that.createTwitterWidget(id);
                    if (id) {
                        data['commentid'] = id;
                    }
                }
            });
        },
        getInitialState: function() {
            return {};
        },
        componentDidMount: function () {
            this.loadTwittCommentsFromServer();
        },
        render: function () {
            var parts = [];
            if (this.state.nocomments) {
                parts.push(
                    React.createElement("div", {className: "alert alert-warning"}, "Comments disabled. ", React.createElement("a", {href: "#"}, "Enable"))
                );
            }
            if (this.state.data) {
                parts.push(
                    React.createElement("section", {id: "titter_frame_container"}, 
                        React.createElement("iframe", {id: "titteriframe", src: "http://titter.webrunes.com", id: "titteriframe", frameBorder: "no", scrolling: "no"})
                    )
                );
            }
            return (
                React.createElement("div", null, 
                    React.createElement("ul", {className: "breadcrumb"}, 
                        React.createElement("li", {className: "active"}, "Add comment")
                    ), 
                    React.createElement(Donatate, null), 
                    parts
                )
            );
        }
    });

    return CreateTitter;
});
