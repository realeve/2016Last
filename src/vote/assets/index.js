    $(function() {

        var getData = function() {
            var str = $('#user option:selected').text();
            str = str.split('.')[1];
            return {
                user: str,
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