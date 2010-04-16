(function($) {

  $.fn.swfuploader = function(options){
    this.each(function(){
      // get the current element
      var $el = $(this);

      // make sure we only instantiate swfuploader once!
      if ( !$el.data('swfuploader') ) {
        //  // try to get metadata
        var metadata = $el.metadata ? ( $el.metadata().swfuploader || {} ) : {};
      
        // determine template
        var set = options.set || metadata.set || SwfUploader.defaultOptions.set;
      
        // getting template class.
        var klass = $.SwfUploader.sets[set];
      
        // options priority (high to low) :
        //  * options passed in
        //  * metadata options
        //  * template options
        //  * default options
        var settings = $.extend( {}, SwfUploader.defaultOptions, klass.defaultOptions, metadata, options );

        // instantiate the template class
        var swfu = new $.SwfUploader($el, settings);
        $el.data('swfuploader', swfu);
      }
    });
  };
  
  var bindFunction = function(fn, target) {
    return function(){
      return fn.apply(target, arguments);
    };
  };
  
  var SwfUploader = function(el, options) {
    this.$el = $(el);
    this.options = options;
    
    this.numFilesQueued = 0;
    this.numFilesUploading = 0;
    this.numFilesCompleted = 0;
    this.totoalBytes = 0;
    this.totoalBytesUploaded = 0;
    
    this.setKlass = $.SwfUploader.sets[this.options.set];
    
    this.events = {};
    
    this.options.file_dialog_complete_handler  =  bindFunction(this.fileDialogComplete, this);
    this.options.file_queued_handler           =  bindFunction(this.fileQueued, this);
    this.options.file_queue_error_handler      =  bindFunction(this.fileQueueError, this);
    this.options.queue_complete_handler        =  bindFunction(this.queueComplete, this);
    this.options.upload_start_handler          =  bindFunction(this.uploadStart, this);
    this.options.upload_progress_handler       =  bindFunction(this.uploadProgress, this);
    this.options.upload_success_handler        =  bindFunction(this.uploadSuccess, this);
    this.options.upload_complete_handler       =  bindFunction(this.uploadComplete, this);
    this.options.upload_error_handler          =  bindFunction(this.uploadError, this);

    // creating set object
    this.set = new this.setKlass(this);

    // letting sets know it can start working!
    this.init();
  };

  SwfUploader.prototype = {
    getStatus : function() {
      return {
        numFilesQueued      : this.numFilesQueued,
        numFilesUploading   : this.numFilesUploading,
        numFilesCompleted   : this.numFilesCompleted,
        numFilesSuccess     : this.numFilesCompleted,
        numFilesFailed      : this.numFilesCompleted,
        totoalBytes         : this.totoalBytes,
        totoalBytesUploaded : this.totoalBytesUploaded
      };
    },
    
    observe : function(eventName, fn, scope){
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push([fn, scope]);
    },
    
    publish : function(eventName, args){
      var listeners = this.events[eventName];
      if(!listeners) {
        return;
      }
      
      $.each(listeners, function(i, listener){
        var fn = listener[0];
        var scope = listener[1];
        fn.apply(scope||window, args);
      });
    },
    
    init : function() {
      this.publish("init", arguments);
      
      // creating swfuplod object
      this.swfu = new SWFUpload(this.options);
    },
  
    // file_dialog_complete_handler
    fileDialogComplete: function(numFilesSelected, numFilesQueued, totalFilesInQueue) {
      this.publish("file_dialog_complete_handler", arguments);
    },
    
    // file_queued_handler
    fileQueued : function(file){
      this.numFilesQueued ++;
      this.totoalBytes += file.size;
      this.publish("file_queued_handler", arguments);
    },
    
    // file_queue_error_handler
    fileQueueError : function(file, errorCode, message){
      this.publish("file_queue_error_handler", arguments);
    },
    
    // queue_complete_handler
    queueComplete : function(numFilesUploaded){
      this.publish("queue_complete_handler", arguments);
    },
    
    // upload_start_handler
    uploadStart : function(file){
      this.numFilesUploading++;
      this.publish("upload_start_handler", arguments);
    },
    
    // upload_progress_handler
    uploadProgress: function(file, bytesLoaded, bytesTotal) {
      this.publish("upload_progress_handler", arguments);
    },
    
    // upload_success_handler
    uploadSuccess: function(file, serverData, response) {
      this.publish("upload_success_handler", arguments);
    },
    
    // upload_complete_handler
    uploadComplete : function(file){
      this.numFilesQueued--;
      this.numFilesUploading--;
      this.numFilesCompleted++;
      this.publish("upload_complete_handler", arguments);
    },
    
    // upload_error_handler
    uploadError: function(file, errorCode, message) {
      this.publish("upload_error_handler", arguments);
    }
  };
  
  SwfUploader.defaultOptions = {
    flash_url               : "/javascripts/swfupload/swfupload.swf",
    upload_url              : "/upload",
    debug                   : false,
    set                     : "MultiFile",
    use_query_string        : true,
    file_post_name          : 'attachment',
    post_params             : {},

    button_image_url        : "",
    button_width            : "140",
    button_height           : "24",
    button_text             : '<span class="button">Select Files to Upload</span>',
    button_text_style       : ".button {font-size: 14px; kerning: true; font-weight: bold; color: #0063DC;text-decoration:underline;}",
    button_text_left_padding: 0,
    button_text_top_padding : 0,
    button_window_mode      : SWFUpload.WINDOW_MODE.TRANSPARENT,
    button_cursor           : SWFUpload.CURSOR.HAND,    

    file_size_limit         : "100 MB",
    file_types              : "*.*",
    file_types_description  : "All Files",
    file_upload_limit       : 0,
    file_queue_limit        : 0    
  };

  var AbstractSet = function(swfuploader){
    this.swfuploader = swfuploader;
    this.$el = this.swfuploader.$el;
    
    this.swfuploader.observe("init"                         , bindFunction(this.init, this));
    this.swfuploader.observe("file_dialog_complete_handler" , bindFunction(this.fileDialogComplete, this));
    this.swfuploader.observe("file_queued_handler"          , bindFunction(this.fileQueued, this));
    this.swfuploader.observe("file_queue_error_handler"     , bindFunction(this.fileQueueError, this));
    this.swfuploader.observe("queue_complete_handler"       , bindFunction(this.queueComplete, this));
    this.swfuploader.observe("upload_start_handler"         , bindFunction(this.uploadStart, this));
    this.swfuploader.observe("upload_progress_handler"      , bindFunction(this.uploadProgress, this));
    this.swfuploader.observe("upload_success_handler"       , bindFunction(this.uploadSuccess, this));
    this.swfuploader.observe("upload_complete_handler"      , bindFunction(this.uploadComplete, this));
    this.swfuploader.observe("upload_error_handler"         , bindFunction(this.uploadError, this));
  };
  
  AbstractSet.prototype = {
    init  : function(){
      
    },
    
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
    },
    
    setButtonPlaceholder : function(el) {
      if(el.jquery){
        el = el[0];
      }
      this.swfuploader.options.button_placeholder = el;
    },
    
    swf : function() {
      return this.swfuploader.swfu;
    },
    
    getStatus : function() {
      return this.swfuploader.getStatus();
    }
  };
  

  SwfUploader.sets = {};
  SwfUploader.sets["AbstractSet"] = AbstractSet;
  
  $.SwfUploader = SwfUploader;
})(jQuery);