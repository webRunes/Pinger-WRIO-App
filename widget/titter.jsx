/**
 * titter related stuff
 */


define(['react','showdown','jquery'], function(React) {

    var importUrl = 'http://wrio.s3-website-us-east-1.amazonaws.com/';
    var converter = new Showdown.converter();
    var finalListJsonArray = [];
    var finalJson;
    var finalJsonArray = [];

    var getScripts = function(){
        var scripts = document.getElementsByTagName("script");
        var jsonData = new Object();
        var jsonArray = [];
        var has = false;
        for(var i=0; i< scripts.length; i++){
            if(scripts[i].type=='application/ld+json'){
                has = true;
                jsonData = JSON.parse(scripts[i].innerHTML);
                jsonArray.push(jsonData);
            }
        }
        var completeJson = jsonArray;
        complete_script=completeJson;

        finalJson = getFinalJSON(completeJson);
    }

    var getFinalJSON = function(json,hasPart){
        if(hasPart==undefined){
            hasPart = false;
        }
        $.each(json,function(i,item){
            comment = this;
            var is_article = false;
            if(comment['@type']=='Article'){
                is_article = true;
                is_airticlelist=true;
            }

            // for list
            if(comment['itemListElement']!=undefined){
                is_list = true;
                for(var i=0;i < comment['itemListElement'].length;i++){
                    name= comment['itemListElement'][i].name;
                    author= comment['itemListElement'][i].author;
                    about= comment['itemListElement'][i].about;
                    url= comment['itemListElement'][i].url;
                    image= comment['itemListElement'][i].image;
                    rowList = {
                        "name": name,
                        "author": comment['name'],
                        "about": about,
                        "url": url,
                        "image": image
                    }
                    finalListJsonArray.push(rowList);
                }
            }
            // for list


            var articlebody = comment['articleBody'];
            if(comment['articleBody']==undefined){
                articlebody = '';
            }
            var newArticle='';
            for(var i=0;i < articlebody.length;i++){
                if(i>0){
                }
                newArticle +=  '<p>' + articlebody[i]  + '</p>';
            }

            row = {
                "is_article": is_article,
                "articlename": comment['name'],
                "articleBody": newArticle,
                "url": '',//comment['url']
                "hasPart": hasPart
            }
            finalJsonArray.push(row);
            //console.log((finalJsonArray).length);
            if(comment.hasPart!=undefined){
                if((comment.hasPart).length > 0){
                    hasParts = comment.hasPart;
                    getFinalJSON(hasParts,true);
                }
            }
        });
        return finalJsonArray;
    }

    getScripts();

    window.onTimelineLoad = function () {
        console.log("Processing triggers when timeline loaded");
        $twitter = $('#twitter-widget-0').contents();
        function autoSizeTimeline() {
            var twitterht = $twitter.find('.h-feed').height();
            console.log("Setting height "+twitterht);
            $('#twitter-widget-0').height((twitterht+100)+'px');
        }


        var prevHeight = $twitter.find('.h-feed').height();
/*
        $twitter.find('.h-feed').attrchange({
            callback: function (e) {
                var curHeight = $(this).height();
                if (prevHeight !== curHeight) {
                    $('#logger').text('height changed from ' + prevHeight + ' to ' + curHeight);

                    prevHeight = curHeight;
                }
            }
        });

*/
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
            loadTwittCommentsFromServer: function () {
                //var url = importUrl + 'Titter-WRIO-App/widget/titter.htm';  // Titter Path
                var that = this;
                if (is_airticlelist == false) {
                    this.setState({data: ""});
                } else {
                    this.setState({data: data});
                }

                $("#titteriframe").on('load', function (event) {
                    console.log("Iframe loaded");
                    var CommendId = function () {
                        var scripts = document.getElementsByTagName("script");
                        var jsonData = new Object();
                        var jsonArray = [];
                        var has = false;
                        for (var i = 0; i < scripts.length; i++) {
                            if (scripts[i].type == 'application/ld+json') {
                                has = true;
                                jsonData = JSON.parse(scripts[i].innerHTML);
                                jsonArray.push(jsonData);
                            }
                        }
                        var completeJson = jsonArray;
                        complete_script = completeJson;

                        return getFinalJSON(completeJson);
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


                   // w.postMessage(JSON.stringify(data), "*");
                });

 /*               $.ajax({
                    url: url,
                    dataType: 'html',
                    success: function (data) {

                        //this.setState({data: data});

                    }.bind(this),
                    error: function (xhr, status, err) {
                        console.error(url, status, err.toString());
                    }.bind(this)
                });*/
            },
            getInitialState: function () {
                return {data: []};
            },
            componentDidMount: function () {
                this.loadTwittCommentsFromServer();

            },
            render: function () {
                if (this.state.nocomments) {
                    return (
                        <section id="titter_frame_container">
                        Comments disabled
                            </section>
                    )
                }
                if (this.state.data) {
                    return (
                        <section id="titter_frame_container">
                            <iframe id="titteriframe" src="http://titter.webrunes.com" id="titteriframe" frameBorder="no" scrolling="no"></iframe>
                        </section>
                    );
                } else {
                    return false;
                }

            }
});

    /*                return (
     < CreateOneTitter data = {this.state.data} />
     );*/
/*
var CreateOneTitter = React.createClass({
        render: function () {
            var rawMarkup = converter.makeHtml(this.props.data.toString());
            if (rawMarkup == "") return false;
            return (<iframe id="titteriframe" src="http://titter.webrunes.com" width="100%" height="2000" frameBorder="no" scrolling="no"></iframe>);
            return (
                <section
                dangerouslySetInnerHTML = {
                {
                    __html: rawMarkup
                }
        } > </section >);
    }});*/
    return CreateTitter;
});