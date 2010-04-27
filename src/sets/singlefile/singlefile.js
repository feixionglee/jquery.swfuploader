(function($){
  
  var t = $.SwfUploader.I18n.t;
  var toNumber = $.SwfUploader.I18n.toNumber;
  var formatFileSize = $.SwfUploader.formatFileSize;
  
  $.SwfUploader.sets.SingleFile = function(swfuploader){
    $.SwfUploader.sets.AbstractSet.apply(this, arguments);
  };
  
  $.extend($.SwfUploader.sets.SingleFile.prototype, $.SwfUploader.sets.AbstractSet.prototype, { 
    init : function() {
    },

    fileDialogComplete: function(numFilesSelected, numFilesQueued, totalFilesInQueue) {
    },
    
    fileQueued : function(file){
    },
    
    fileQueueError : function(file, errorCode, message){
    },
    
    queueComplete : function(numFilesUploaded){
    },
    
    uploadStart : function(file){
    },
    
    uploadProgress: function(file, bytesLoaded, bytesTotal) {
    },
    
    uploadSuccess: function(file, serverData, response) {
    },
    
    uploadComplete : function(file){
    },
    
    uploadError: function(file, errorCode, message) {
    }
  });
})(jQuery);