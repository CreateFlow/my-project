
    /*添加“回到顶部” start*/
    var g_backTopConfig = {
        isTopShow : false,
        isInScrolling : false
    };

    //为当前页面添加scroll响应
    $(window).bind("scroll",function(){

        // if($(".back-top").length == 0)
        // {
        //     //为当前页面添加back-top链接
        //     var h = '<div><a class="back-top trans_link_5" href="#body-top" onclick="backTop()"></a></div>';
        //     $(document.body).append(h);

        //     //href=#body-top 这个是为了兼容IE8 ie8动态绑定的onclick有时候会不响应
        //     $(document.body).attr("id", "body-top");
        // }

        $(document.body).attr("id", "body-top");

        //控制back-top链接的显示和隐藏
        topFadeToggle();

        //当滑动到底部时 设置back-top的bottom距离
        setBackTopBottom();
    })

    //根据g_backTopConfig.isTopShow判断显示或隐藏back-top链接
    function topFadeToggle()
    {
        /*isInScrolling 这个判断有2个作用
         1. 向上滚动是一个animate({scrollTop:0}的动画，会多次触发scroll事件，
         在这个过程中会显示隐藏back-top链接 并无必要 所以直接返回
         2. 多次进入会让fadeIn()触发多次，这样有个问题就是页面已经到顶了，
         但是$(".back-top")还在不停的显示和隐藏 这样就可以避免掉
         */
        if(g_backTopConfig.isInScrolling)
        {
            return false;
        }

        if(g_backTopConfig.isTopShow)
        {
            if ($(window).scrollTop() <= 200)
            {
                $(".back-top").fadeOut(500);
                g_backTopConfig.isTopShow = false;
            }
        }
        else
        {
            if ($(window).scrollTop() > 200)
            {
                $(".back-top").fadeIn(500);
                g_backTopConfig.isTopShow = true;
            }
        }
    }

    //back-top的onclick事件
    function backTop()
    {
        g_backTopConfig.isInScrolling = true;

        $(document.body).animate({scrollTop:0},500,function(){
            g_backTopConfig.isInScrolling = false;
            topFadeToggle();
        });
    }

    //设置back-top链接的位置
    function setBackTopBottom()
    {
        var hScroll = $(window).scrollTop();
        var hDocument = $(document).height();
        var hWindow = $(window).height();
        var hBottom = $(".side").css("bottom");

        if((hDocument - hWindow) == hScroll)
        {
            $(".side").css("bottom", 330);
        }
        else
        {
            if(hBottom == "330px")
            {
                $(".side").css("bottom", 120);
            }
        }
    }
    /*添加“回到顶部” end*/
