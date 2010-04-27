(function($){
  
  var t = $.SwfUploader.I18n.t;
  var toNumber = $.SwfUploader.I18n.toNumber;
  var formatFileSize = $.SwfUploader.formatFileSize;
  
  $.SwfUploader.sets.MultiFile = function(swfuploader){
    $.SwfUploader.sets.AbstractSet.apply(this, arguments);
  };
  
  $.extend($.SwfUploader.sets.MultiFile.prototype, $.SwfUploader.sets.AbstractSet.prototype, { 
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
      progress.setStatus( t( "jquery.swfuploader.multifile.status.pending", { 'default' : "Queued For Upload." } ) );
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    fileQueueError : function(file, errorCode, message){
      if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
        var str = "You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file."));
        alert( t( "jquery.swfuploader.multifile.errors.queue_full", { count : message , 'default' : str } ) );
        return;
      }

      var progress = UploadProgress.getInstance(file.id) || new UploadProgress(file, this.uploadBucket.$container, this.swf());
      
      progress.setError();
      progress.toggleCancel(false);

      switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        progress.setStatus( t( "jquery.swfuploader.multifile.errors.file_too_big", { code : errorCode, message : message, 'default' : "File is too big." } ) );
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        progress.setStatus( t( "jquery.swfuploader.multifile.errors.zero_byte_file", { code : errorCode, message : message, 'default' : "Cannot upload Zero Byte files." } ) );
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        progress.setStatus( t( "jquery.swfuploader.multifile.errors.invalid_file_type", { code : errorCode, message : message, 'default' : "Invalid File Type." } ) );
        break;
      default:
        if (file !== null) {
          progress.setStatus( t( "jquery.swfuploader.multifile.errors.unknown_error", { code : errorCode, message : message, 'default' : "Ooops... Something went wrong." } ) );
        }
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
      progress.setStatus( t( "jquery.swfuploader.multifile.status.starting", { 'default' : "Starting To Upload." } ) );
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    uploadProgress: function(file, bytesLoaded, bytesTotal) {
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      var progress = UploadProgress.getInstance(file.id);
      progress.setProgress(percent);
      var defaultMessage = percent + "% done.";
      progress.setStatus(  t( "jquery.swfuploader.multifile.status.percent_done", { percent : percent, 'default' : defaultMessage } ) );
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    uploadSuccess: function(file, serverData, response) {
      var progress = UploadProgress.getInstance(file.id);
      progress.setStatus( t( "jquery.swfuploader.multifile.status.success", { 'default' : "Successfully Uploaded." } ) );
      progress.setComplete();
      progress.toggleCancel(false);
      
      this.uploadBucket.updateStats(this.getStatus());
    },
    
    uploadComplete : function(file){
      this.uploadBucket.updateStats(this.getStatus());  
    },
    
    uploadError: function(file, errorCode, message) {
      var progress = UploadProgress.getInstance(file.id);
      var defaultMessage = null;
      
      progress.setError();
      progress.toggleCancel(false);

      switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        defaultMessage = "Upload Error: " + message;
        message =  t( "jquery.swfuploader.multifile.errors.upload_error", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        defaultMessage = "Upload Failed: " + message;
        message =  t( "jquery.swfuploader.multifile.errors.upload_failure", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        defaultMessage = "Server (IO) Error: " + message;
        message =  t( "jquery.swfuploader.multifile.errors.server_io_error", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        defaultMessage = "Security Error: " + message;
        message =  t( "jquery.swfuploader.multifile.errors.security_error", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        defaultMessage = "Upload limit exceeded: " + message;
        message =  t( "jquery.swfuploader.multifile.errors.upload_limit_exceeded", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        defaultMessage = "Failed Validation, upload skipped. Message: " + message;
        message =  t( "jquery.swfuploader.multifile.errors.validation_failure", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
        defaultMessage = "File Canceled.";
        message =  t( "jquery.swfuploader.multifile.errors.file_canceled", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        defaultMessage = "Upload Stopped.";
        message =  t( "jquery.swfuploader.multifile.errors.stopped", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      default:
        defaultMessage = "Unhandled Error: " + errorCode;
        message =  t( "jquery.swfuploader.multifile.errors.unkown_error", { 'default' : defaultMessage, message : message, error : errorCode } );
        break;
      }
      
      progress.setStatus(message);
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
      var $name = $('<div>').addClass("name").text( t( "jquery.swfuploader.multifile.labels.name", { 'default' : "name" } ) );
      var $size = $('<div>').addClass("size").text( t( "jquery.swfuploader.multifile.labels.size", { 'default' : "size" } ) );
      var $select = $('<div>').addClass("select").text(  t( "jquery.swfuploader.multifile.labels.select", { 'default' : "remove?" } ) );

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
      this.$totalSize = $('<div>').addClass("total-size").html("&nbsp");
      this.$totalFiles = $('<div>').addClass("total-files").html("&nbsp");
      
      this.$footer = $('<div>')
        .addClass("footer")
        .append($buttonPlaceholder)
        .append(this.$totalSize)
        .append(this.$totalFiles);
        
      this.$buttonPlaceholder = $buttonPlaceholder;

      return this.$footer;
    },
    
    getButtonPlaceHolder : function(){
      return this.$buttonPlaceholder;
    },
    
    updateStats : function(status){
      var bytes = formatFileSize(status.totalBytes);
      var defaultSizeStr = "Size: " + bytes
      var defaultFilesStr = "Files: " + status.numFilesSuccess + " / " + status.totalFiles;
      var sizeStr = t( "jquery.swfuploader.multifile.labels.total_size", { size : bytes, 'default' : defaultSizeStr } );
      var filesStr = t( "jquery.swfuploader.multifile.labels.total_files", { success : status.numFilesSuccess, total : status.totalFiles, 'default' : defaultFilesStr } );
      
      this.$totalSize.html(sizeStr);
      this.$totalFiles.html(filesStr);
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
      this.$fileSize = $("<div>").addClass("size").text(formatFileSize(this.file.size));
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
      if(status)
      {
        this.$statusMessage.html(status);
      }
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