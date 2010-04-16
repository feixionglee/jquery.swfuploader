(function($){
  $.SwfUploader.sets.MultiFile = function(swfuploader){
    $.SwfUploader.sets.AbstractSet.apply(this, arguments);
  };
  
  $.SwfUploader.sets.MultiFile.prototype = $.extend($.SwfUploader.sets.AbstractSet.prototype, { 
    init : function() {
      this.uploadBucket = new UploadBucket(this.$el);
      this.setButtonPlaceholder(this.uploadBucket.getButtonPlaceHolder());
    },

    fileDialogComplete: function(numFilesSelected, numFilesQueued, totalFilesInQueue) {
      this.uploadBucket.$el.removeClass("init");
      this.swf().startUpload();
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    fileQueued : function(file){
      var progress = new UploadProgress(file, this.uploadBucket.$container, this.swf());
      progress.toggleCancel(true);
      progress.setStatus("Pending...");
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    fileQueueError : function(file, errorCode, message){
      if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
        alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
        return;
      }

      var progress = UploadProgress.getInstance(file.id) || new UploadProgress(file, this.uploadBucket.$container, this.swf());
      
      progress.setError();
      progress.toggleCancel(false);

      switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        progress.setStatus("File is too big.");
        this.swf().debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        progress.setStatus("Cannot upload Zero Byte files.");
        this.swf().debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        progress.setStatus("Invalid File Type.");
        this.swf().debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      default:
        if (file !== null) {
          progress.setStatus("Unhandled Error");
        }
        this.swf().debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      }
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    queueComplete : function(numFilesUploaded){
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    uploadStart : function(file){
      var progress = UploadProgress.getInstance(file.id);
      progress.setStart();
      progress.setStatus("Pending...");
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    uploadProgress: function(file, bytesLoaded, bytesTotal) {
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      var progress = UploadProgress.getInstance(file.id);
      progress.setProgress(percent);
      progress.setStatus(percent + "% done.");
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    uploadSuccess: function(file, serverData, response) {
      var progress = UploadProgress.getInstance(file.id);
      progress.setStatus("Success!");
      progress.setComplete();
      progress.toggleCancel(false);
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    uploadComplete : function(file){
      this.uploadBucket.updateStats(this.getStatus());  
    },
    
    uploadError: function(file, errorCode, message) {
      var progress = UploadProgress.getInstance(file.id);
      
      progress.setError();
      progress.toggleCancel(false);

      switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        progress.setStatus("Upload Error: " + message);
        this.swf().debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        progress.setStatus("Upload Failed.");
        this.swf().debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        progress.setStatus("Server (IO) Error");
        this.swf().debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        progress.setStatus("Security Error");
        this.swf().debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        progress.setStatus("Upload limit exceeded.");
        this.swf().debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        progress.setStatus("Failed Validation.  Upload skipped.");
        this.swf().debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
        // If there aren't any files left (they were all cancelled) disable the cancel button
        if (this.swf().getStats().files_queued === 0) {
          // disable buttons?
        }
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        progress.setStatus("Stopped");
        break;
      default:
        progress.setStatus("Unhandled Error: " + errorCode);
        this.swf().debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      }
      
      this.uploadBucket.updateStats(this.getStatus());
    }
  });
  
  var UploadBucket = function(target){
    this.$target = target;
    this.$el = $('<div>')
      .addClass("upload-bucket")
      .addClass("init")
      .append(this.buildHeader())
      .append(this.buildContainer())
      .append(this.buildFooter());
      
    this.$target.append(this.$el);
  };
  
  UploadBucket.prototype = {
    buildHeader : function(){
      var $name = $('<div>').addClass("name").text("name");
      var $size = $('<div>').addClass("size").text("size");
      var $select = $('<div>').addClass("select").text("remove?");

      this.$header = $('<div>')
        .addClass("header")
        .append($name)
        .append($size)
        .append($select);
        
      return this.$header;
    },
    
    buildContainer : function(){
      this.$container = $('<div>').addClass("upload-queue");
      return this.$container;
    },
    
    buildFooter : function(){
      var $buttonPlaceholder = $('<div>').addClass("upload-button").html("&nbsp");
      var $totalSize = $('<div>').addClass("total-size").html("&nbsp");
      var $totalFiles = $('<div>').addClass("total-files").html("&nbsp");
      
      this.$footer = $('<div>')
        .addClass("footer")
        .append($buttonPlaceholder)
        .append($totalSize)
        .append($totalFiles);
        
      this.$buttonPlaceholder = $buttonPlaceholder;
        
      return this.$footer;
    },
    
    getButtonPlaceHolder : function(){
      return this.$buttonPlaceholder;
    },
    
    updateStats : function(status){
      console.log(status);
    }
  };
  
  var uploadProgressInstances = {};
  var UploadProgress = function(file, target, swfu){
    var self = this;
    
    this.file = file;
    this.swfu = swfu;
    this.$target = target;
    this.buildSuccessButton();
    this.buildErrorButton();

    this.$el = $('<div>').addClass("upload-progress")
      .append(this.buildIndicator())
      .append(this.buildFileName())
      .append(this.buildFileSize())
      .append(this.buildRemoveButton())
      .append(this.buildStatus())
      .appendTo(this.$target)
      .hoverIntent( function(){ self.$status.fadeIn();}, function(){ self.$status.fadeOut();});

    uploadProgressInstances[file.id] = this;    
  };
  
  UploadProgress.getInstance = function(fileId){
    return uploadProgressInstances[fileId];
  };
  
  UploadProgress.prototype = {
    buildFileName: function(){
      this.$fileName = $("<div>").addClass("name").text(this.file.name);
      return this.$fileName;
    },
    
    buildFileSize: function(){
      this.$fileSize = $("<div>").addClass("size").text(this.file.size);
      return this.$fileSize;      
    },
    
    buildRemoveButton: function(){
      this.$removeButtonLink = $("<a>").addClass("remove").attr("href", "#");
      this.$removeButton = $("<div>").addClass("select").append(this.$removeButtonLink);
      return this.$removeButton;      
    },
    
    buildIndicator: function(){
      var $indicatorPadding = $('<div>').addClass("indicator-padding");
      var $indicatorMarker = $('<div>').addClass("indicator-marker");
      this.$indicator = $('<div>')
        .addClass("indicator")
        .append($indicatorPadding)
        .append($indicatorMarker)
        .hide();
        
      return this.$indicator;
    },
    
    buildStatus: function(){
      var $statusLeft = $('<div>').addClass("status-left");
      this.$statusMessage = $('<div>').addClass("status-message");
      this.$status = $('<div>')
        .addClass("status")
        .append($statusLeft)
        .append(this.$statusMessage)
        .hide();
        
      return this.$status;
    },
    
    buildSuccessButton: function(){
      this.$successButton = $("<span>").addClass("success");
      return this.$successButton;     
    },
    
    buildErrorButton: function(){
      this.$errorButton = $("<span>").addClass("error");
      return this.$errorButton;     
    },    
    
    toggleCancel: function(bool){
      if(bool){
        this.$removeButtonLink.show();
      } else {
        this.$removeButtonLink.hide();
      }
    },
    
    setError : function() {
      this.toggleCancel(false);
      this.$el.addClass("error");
      this.$removeButton.append(this.$errorButton);      
    },
    
    setStatus : function(status) {
      this.$statusMessage.html(status);
    },
    
    setStart : function() {
      this.$indicator.show();
    },
    
    setProgress : function(percent) {
      width = percent + "%"
      this.$indicator.css({width : width});
    },
    
    setComplete : function(){
      this.$el.addClass("success");
      this.toggleCancel(false);
      this.$removeButton.append(this.$successButton);     
    }
    
  };
  
})(jQuery);