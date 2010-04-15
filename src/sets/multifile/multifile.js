(function($){
	$.SwfUploader.sets.MultiFile = function(swfuploader){
		$.SwfUploader.sets.AbstractSet.apply(this, arguments);
	};
	
	$.SwfUploader.sets.MultiFile.prototype = $.extend($.SwfUploader.sets.AbstractSet.prototype, {	
		init : function() {
			this.setButtonPlaceholder(this.$el);
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