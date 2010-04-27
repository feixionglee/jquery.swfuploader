(function($){
  
  if(typeof I18n !== "undefined"){

    var t = $.proxy(I18n.t, I18n);
    var toNumber = $.proxy(I18n.toNumber, I18n);

  }else{

    var t = function(scope, options){
      return options["default"];
    };
    
    var toNumber = function(number, options){
      return parseInt(number.toString());
    };
  }
  
  
  var formatFileSize = function(size){
    var unit = "";
    var kb = 1024;

    var mb = kb*kb;
    var gb = mb*kb;
    var tb = gb*kb;

    if( (size / tb) > 1){
      size = (size / tb);
      unit = "TB";
    } else if( (size / gb) > 1) {
      size = (size / gb);
      unit = "GB";      
    } else if( (size / mb) > 1) {
      size = (size / mb);
      unit = "MB";      
    } else if( (size / kb) > 1) {
      size = (size / kb);
      unit = "KB";      
    } else {
      size = size;
      unit = "B"
    }
    
    return (toNumber(size) + " " + unit);
  };
  
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