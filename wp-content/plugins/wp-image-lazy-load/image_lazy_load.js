/*
  Plugin Name: Zedna WP Image Lazy Load
  Plugin URI: https://profiles.wordpress.org/zedna#content-plugins
  Text Domain: wp-image-lazy-load
  Domain Path: /languages
  Description: Image lazy load plugin to boost page load time and save bandwidth by removing all the images, background-images, responsive images, iframes and videos. Elements will load just when reach visible part of screen.
  Version: 1.6.1
  Author: Radek Mezulanik
  Author URI: https://cz.linkedin.com/in/radekmezulanik
  License: GPL3
*/

(function($) {
    //get options from DB
    var skipIframe = wpimagelazyload_settings.wpimagelazyloadsetting_skipiframe; //true=skip iframe, false=apply the code
    var skipParent = wpimagelazyload_settings.wpimagelazyloadsetting_skipparent;
    var skipAllParent = wpimagelazyload_settings.wpimagelazyloadsetting_skipallparent;
    var skipVideo = wpimagelazyload_settings.wpimagelazyloadsetting_skipvideo;
    var loadonposition = parseInt(wpimagelazyload_settings.wpimagelazyloadsetting_loadonposition);
    var importantVC = wpimagelazyload_settings.wpimagelazyloadsetting_importantvc;

    $('document').ready(function() {

        //set visible part of screen
        var scrollBottom = $(window).scrollTop() + window.innerHeight;

        /*
        -remove & backup source from images
        -remove & backup source set from responsive images
        -give back source of visible images
        -for some browsers, `bgbak` is undefined; for others, `bgbak` is false -> check both like: if (typeof srcsetbak !== typeof undefined && srcsetbak !== false)
        */
        $('img').each(function() {
            if (skipAllParent.length != 0) {
                var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
            }
            if (found && skipAllParent.length != 0) {
                //skip this element
            } else {
                this.setAttribute('src-backup', this.src);
                var elements = $(this);
                var elementsoffset = elements.offset();
                var isvisibleOriginal = parseInt(elementsoffset.top);
                var isvisible = isvisibleOriginal + loadonposition;
                var srcsetbak = $(this).attr('srcset');
                var elements = $(this);
                var elementsoffset = elements.offset();
                var isvisibleOriginal = parseInt(elementsoffset.top);
                var isvisible = isvisibleOriginal + loadonposition;
                if (srcsetbak) {
                    $(this).attr("srcset-backup", srcsetbak);
                }
                if (scrollBottom < isvisible) {
                    this.style.cssText = "opacity:0;";
                    this.setAttribute('src', '');
                    this.setAttribute('srcset', '');
                }
            }
        });

        /*
        remove & backup source from videos
        give back source of visible videos
        */
        if (skipVideo == "false") {
            $('video').each(function() {
                if (skipAllParent.length != 0) {
                    var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
                }
                if (found && skipAllParent.length != 0) {
                    //skip this element
                } else {
                    this.setAttribute('src-backup', this.src);
                    var elements = $(this);
                    var elementsoffset = elements.offset();
                    var isvisibleOriginal = parseInt(elementsoffset.top);
                    var isvisible = isvisibleOriginal + loadonposition;
                    if (scrollBottom < isvisible) {
                        this.style.cssText = "opacity:0;";
                        this.setAttribute('src', '');
                    }
                }
            });
        }

        /*
        remove & backup source from iframes
        give back source of visible iframes
        */
        if (skipIframe == "false") {
            $('iframe').each(function() {
                if (skipAllParent.length != 0) {
                    var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
                }
                if (found && skipAllParent.length != 0) {
                    //skip this element
                } else {
                    this.setAttribute('src-backup', this.src);
                    var elements = $(this);
                    var elementsoffset = elements.offset();
                    var isvisibleOriginal = parseInt(elementsoffset.top);
                    var isvisible = isvisibleOriginal + loadonposition;
                    if (skipParent.length != 0) {
                        var found = $(this).parents().hasClass(skipParent); //look for ignored parent
                    }
                    if (found && skipParent.length != 0) {
                        //skip this iframe
                    } else {
                        if (scrollBottom < isvisible) {
                            this.setAttribute('src', '');
                            this.style.cssText = "opacity:0;";
                        } else {
                            this.style.opacity = "1";
                        }
                    }
                }
            });
        }

        $("*").each(function() {
            if (skipAllParent.length != 0) {
                var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
            }
            if (found && skipAllParent.length != 0) {
                //skip this element
            } else {
                //remove & backup background-image from all elements
                if ($(this).css('background-image').indexOf('url') > -1) {
                    var bg = $(this).css('background-image');
                    $(this).attr("background-image-backup", bg);
                    if (importantVC) {
                        $(this).css('cssText', 'background-image: none !important');
                    } else {
                        $(this).css('background-image', 'none');
                    }
                }
                //give back background-image of all visible elements
                var bgbak = $(this).attr("background-image-backup");
                if (bgbak) {
                    var elements = $(this);
                    var elementsoffset = elements.offset();
                    var isvisibleOriginal = parseInt(elementsoffset.top);
                    var isvisible = isvisibleOriginal + loadonposition;
                    if (scrollBottom >= isvisible) {
                        if (importantVC) {
                            $(this).css('cssText', "background-image: " + bgbak + " !important");
                        } else {
                            $(this).css("background-image", bgbak);
                        }
                    }
                }
            }
        });
    });

    //Detect if user scrolled to the image
    $(window).scroll(function() {

        //set visible part of screen
        var scrollBottom = $(window).scrollTop() + window.innerHeight;

        //give back source of visible images
        $('img').each(function() {
            if (skipAllParent.length != 0) {
                var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
            }
            if (found && skipAllParent.length != 0) {
                //skip this element
            } else {
                var isLoaded = $(this).attr("src");
                var isLoaded2 = $(this).attr("srcset");
                var hasBackup = $(this).attr("srcset-backup");
                var elements = $(this);
                var elementsoffset = elements.offset();
                var isvisibleOriginal = parseInt(elementsoffset.top);
                var isvisible = isvisibleOriginal + loadonposition;
                if (scrollBottom >= isvisible) {
                    if (!isLoaded) { //check if source is not set
                        this.src = this.getAttribute('src-backup');
                        this.className += " fadein";
                        this.style.opacity = "1";
                    }
                    if (!isLoaded2) { //check if source is not set
                        if (hasBackup) {
                            $(this).attr("srcset", hasBackup);
                        }
                    }
                }
            }
        });

        //give back source of visible videos
        if (skipVideo == "false") {
            $('video').each(function() {
                if (skipAllParent.length != 0) {
                    var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
                }
                if (found && skipAllParent.length != 0) {
                    //skip this element
                } else {
                    var isLoaded = $(this).attr("src");
                    var isLoaded2 = $(this).attr("srcset");
                    var hasBackup = $(this).attr("srcset-backup");
                    var elements = $(this);
                    var elementsoffset = elements.offset();
                    var isvisibleOriginal = parseInt(elementsoffset.top);
                    var isvisible = isvisibleOriginal + loadonposition;
                    if (scrollBottom >= isvisible) {
                        if (!isLoaded) { //check if source is not set
                            this.src = this.getAttribute('src-backup');
                            this.className += " fadein";
                            this.style.opacity = "1";
                        }
                        if (!isLoaded2) { //check if source is not set
                            if (hasBackup) {
                                $(this).attr("srcset", hasBackup);
                            }
                        }
                    }
                }
            });
        }

        //give back source of visible iframes
        if (skipIframe == "false") {
            $('iframe').each(function() {
                if (skipAllParent.length != 0) {
                    var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
                }
                if (found && skipAllParent.length != 0) {
                    //skip this element
                } else {
                    var isLoaded = $(this).attr("src");
                    var elements = $(this);
                    var elementsoffset = elements.offset();
                    var isvisibleOriginal = parseInt(elementsoffset.top);
                    var isvisible = isvisibleOriginal + loadonposition;
                    var hasBackup = $(this).attr("src-backup"); //check if iframe has backup source
                    if (skipParent.length != 0) {
                        var found = $(this).parents().hasClass(skipParent); //look for ignored parent
                    }
                    if (scrollBottom >= isvisible) {
                        if (!isLoaded) { //check if source is not set
                            if (found && skipParent.length != 0) {
                                //ignored parent was found, so leave it as it is
                            } else {
                                this.src = this.getAttribute('src-backup');
                                this.className += " fadein";
                                this.style.opacity = "1";

                            }
                        }
                    }
                }
            });
        }

        //give back background-image of all visible elements        
        $("*").each(function() {
            if (skipAllParent.length != 0) {
                var found = $(this).parents().hasClass(skipAllParent); //look for ignored parent
            }
            if (found && skipAllParent.length != 0) {
                //skip this element
            } else {
                var bgbak = $(this).attr("background-image-backup");
                if (bgbak) {
                    var elements = $(this);
                    var elementsoffset = elements.offset();
                    var isvisibleOriginal = parseInt(elementsoffset.top);
                    var isvisible = isvisibleOriginal + loadonposition;
                    if (scrollBottom >= isvisible) {
                        if ($(this).css('background-image').indexOf('url') == -1) { //check if source is not set
                            if (importantVC) {
                                $(this).css('cssText', "background-image: " + bgbak + " !important");
                            } else {
                                $(this).css("background-image", bgbak);
                            }
                        }
                    };
                }
            }
        });
    });
})(jQuery);