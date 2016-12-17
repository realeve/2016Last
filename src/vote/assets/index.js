    $(function() {

        var getData = function() {
            return {
                user: $('#user option:selected').text(),
                score: $('#score').val()
            };
        };

        var submitScore = function() {
            var option = getData();
            var url = 'http://cbpc540.applinzi.com/index.php?s=/addon/GoodVoice/GoodVoice/onlineVoteHr';

            $.ajax({
                    url: url,
                    data: option,
                    async: false,
                    dataType: "jsonp",
                    callback: "JsonCallback"
                })
                .done(function(obj) {
                    console.log(obj);
                    if (obj.status) {
                        $('#toast').show();
                        setTimeout(function() {
                            $('#toast').hide();
                        }, 2000);
                    } else {
                        $('#err').show();
                        setTimeout(function() {
                            $('#err').hide();
                        }, 2000);
                    }
                })
                .always(function() {
                    resetData();
                });
        };

        $('#submit').on('click', function() {
            submitScore();
        });

        var resetData = function() {
            $('#score').val(0);
        };

    });