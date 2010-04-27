(function($){
  $.SwfUploader.sets.ExampleSet = function(swfuploader){
    // calling AbstractSet constructor
    $.SwfUploader.sets.AbstractSet.apply(this, arguments);
  };
  
  $.extend($.SwfUploader.sets.ExampleSet.prototype, $.SwfUploader.sets.AbstractSet.prototype, {
    
    /***************************************************************************************************
    *
    *  This function is called when swfuploader finishes instantiation
    *  The SwfUpload Object is not created yet.
    *  You can create your UI objects, setting up interactions and behaviors here
    *  IMPORTANT: you must call #setButtonPlaceholder here
    *             so SwfUpload can create the flash object by replacing the placeholder element
    *
    *****************************************************************************************************/    
    init : function() {
      this.setButtonPlaceholder(this.$el);
    },
    
    
    /***************************************************************************************************
    *
    *  Event Handlers, see SwfUpload documentation for more details
    *  SwfUpload documentation:  http://demo.swfupload.org/Documentation/
    *
    *****************************************************************************************************/  
    // file_dialog_complete_handler
    fileDialogComplete: function(numFilesSelected, numFilesQueued, totalFilesInQueue) {
    },
    
    // file_queued_handler
    fileQueued : function(file){
    },
    
    // file_queue_error_handler
    fileQueueError : function(file, errorCode, message){
    },
    
    // queue_complete_handler
    queueComplete : function(numFilesUploaded){
    },
    
    // upload_start_handler
    uploadStart : function(file){
    },
    
    // upload_progress_handler
    uploadProgress: function(file, bytesLoaded, bytesTotal) {
      
    },
    
    // upload_success_handler
    uploadSuccess: function(file, serverData, response) {
      
    },
    
    // upload_complete_handler
    uploadComplete : function(file){
    },
    
    // upload_error_handler
    uploadError: function(file, errorCode, message) {
    }

  }); 
  
})(jQuery);