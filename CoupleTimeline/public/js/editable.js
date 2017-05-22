var editable_focused = "";

function init_editable() {
    // editable-btn 찾기
    var editable = $(".editable-btn");
    editable.each(function() {
        onEditable(this.closest("form").id, false);
    });
}

function createButton(id, type) {
    var div = $("#" + id + " .editable-btn");
    div.empty();
    if (!type) {
        var btn = $('<button type="button" onclick="onEditable(\'' + id + '\', true)" class="btn btn-primary pull-right"><i class="fa fa-pencil" aria-hidden="true"></i></button>');
        btn.appendTo(div);
    } else {
        var btn = $('<button type="button" onclick="onEditable(\'' + id + '\', false)" class="btn btn-default"><i class="fa fa-close" aria-hidden="true"></i></button>');
        btn.appendTo(div);
        var btn = $('<button type="submit" class="btn btn-success pull-right"><i class="fa fa-share" aria-hidden="true"></i></button>');
        btn.appendTo(div);
    }
}

function onEditable(id, type) {
    if (type) {
        if (editable_focused != "") {
            alert("이미 다른 항목을 수정중입니다.");
            return;
        }
        editable_focused = id;
    } else {
        editable_focused = "";
    }
    $("#" + id).find("[editable]").attr("disabled", !type);
    createButton(id, type);
}


$(function() {
    init_editable();
});
