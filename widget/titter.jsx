/**
 * titter related stuff
 */


define(['react', 'showdown', 'jquery'], function(React) {

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
    }

    function createTwitterWidget(commentId) {

      //  var frameheight = $(window).height();

        var twheight = 10000;
        $('#titteriframe').height("190px");

        var twitter_template = '<a class="twitter-timeline" href="https://twitter.com/search?q=' + window.location.href + '" data-widget-id="' + commentId + '" width="' + $(window).width() + '" height="'+twheight+'" data-chrome="nofooter">Tweets about ' + window.location.href + '</a>'
        $('#titter_frame_container').append(twitter_template);

        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
            if(!d.getElementById(id)){js=d.createElement(s);js.id=id;
                js.src=p+"://platform.twitter.com/widgets.js";
                js.setAttribute('onload', "twttr.events.bind('rendered',function(e) {onTimelineLoad()});");
                fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    }

    var CreateTitter = React.createClass({
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
                    that.setState({nocomments: "true"});
                } else {
                    createTwitterWidget(id);
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
            if (this.state.nocomments) {
                return (
                    <div className="alert alert-warning">Comments disabled. <a href="#">Enable</a></div>
                )
            }
            if (this.state.data) {
                return (
                    <section id="titter_frame_container">
                        <iframe id="titteriframe" src="http://titter.webrunes.com" id="titteriframe" frameBorder="no" scrolling="no" />
                    </section>
                );
            } else {
                return false;
            }
        }
    });

    return CreateTitter;
});
