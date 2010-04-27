(function($){
  
  var t = $.SwfUploader.I18n.t;
  var toNumber = $.SwfUploader.I18n.toNumber;
  var formatFileSize = $.SwfUploader.formatFileSize;
  
  $.SwfUploader.sets.SingleFile = function(swfuploader){
    $.SwfUploader.sets.AbstractSet.apply(this, arguments);
  };
  
  $.extend($.SwfUploader.sets.SingleFile.prototype, $.SwfUploader.sets.AbstractSet.prototype, { 
    init : function() {
      this.$buttonPlacehoder = $("<div>").addClass("upload-button-placeholder");
      this.$button = $("<div>").addClass("upload-button").append(this.$buttonPlacehoder);
      
      this.$indicator = $("<div>").addClass("indicator");
      this.$progress = $("<div>").addClass("upload-progress-bar").append(this.$indicator);
      
      this.$status = $("<div>").addClass("upload-status");
      
      this.$cancel = $("<a>")
        .addClass("upload-cancel")
        .html("cancel")
        .attr("href", "#")
        .click($.proxy(function(){
          this.swf().cancelUpload(this.fileId);
        }, this));

      this.$container = $("<div>").addClass("upload-container")
        .append(this.$progress)
        .append(this.$cancel)
        .append(this.$status)
        .hide();
      
      this.$el.append(this.$button).append(this.$container); 
      this.setButtonPlaceholder(this.$buttonPlacehoder);
    },

    fileDialogComplete: function(numFilesSelected, numFilesQueued, totalFilesInQueue) {
      if(numFilesSelected == 0) return;
      // change the interface to upload progress with cancel button
      this.$button.css({width:'0px', height:'0px', visibility:'hidden'});
      // start the upload
      this.swf().startUpload();
    },
    
    fileQueued : function(file){
      console.log("fileQueued", arguments);
      this.$container.show();
      this.fileId = file.id;
    },
    
    fileQueueError : function(file, errorCode, message){
      console.log("fileQueueError", arguments);
    },
    
    queueComplete : function(numFilesUploaded){
      console.log("queueComplete", arguments);
    },
    
    uploadStart : function(file){
      console.log("uploadStart", arguments, this);
      this.$status.html("Upload started...");
    },
    
    uploadProgress: function(file, bytesLoaded, bytesTotal) {
      console.log("uploadProgress", arguments);
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      percent = percent + "%"
      this.$indicator.css('width', percent);
      this.$status.html(percent + " done");
      
    },
    
    uploadSuccess: function(file, serverData, response) {
      console.log("uploadSuccess", arguments);
      this.$status.html("upload success!");
    },
    
    uploadComplete : function(file){
      console.log("uploadComplete", arguments);
      this.$cancel.hide();
    },
    
    uploadError: function(file, errorCode, message) {
      console.log("uploadError", arguments);
      this.$status.html("upload error!");
    }
  });
  
  $.SwfUploader.sets.SingleFile.defaultOptions = {
    button_image_url        : "",
    button_width            : "140",
    button_height           : "24",
    button_text             : '<span class="button">Select A File to Upload</span>',
    button_text_style       : ".button {font-size: 14px; kerning: true; font-weight: bold; color: #0063DC;text-decoration:underline;text-align:center}",
    button_text_left_padding: 0,
    button_text_top_padding : 0,
    button_action           : SWFUpload.BUTTON_ACTION.SELECT_FILES,   

    file_upload_limit       : 1,
    file_queue_limit        : 1
  }
})(jQuery);