(function($) {

  $.fn.swfuploader = function(options){
    options = options || {};
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
        //  * set options
        //  * default options
        var settings = $.extend( {}, SwfUploader.defaultOptions, klass.defaultOptions, metadata, options );

        // instantiate the template class
        var swfu = new $.SwfUploader($el, settings);
        $el.data('swfuploader', swfu);
      }
    });
    
    // returns the jquery object    
    return this;
  };
  
  // backporting proxy function from jquery 1.4
  $.proxy = $.proxy || function(fn, target) {
    return function(){
      return fn.apply(target, arguments);
    };
  };
  
  var SwfUploader = function(el, options) {
    this.$el = $(el);
    this.options = options;
    
    this.status = {
      numFilesQueued      : 0,
      numFilesUploading   : 0,
      numFilesCompleted   : 0,
      numFilesSuccess     : 0,
      numFilesFailed      : 0,
      totalFiles          : 0,
      totalBytes          : 0,
      totalBytesUploaded  : 0
    };
    
    this.setKlass = $.SwfUploader.sets[this.options.set];

    this.events = {};
    
    // save user defined callbacks
    this.userCallbacks = {
      init_handler                    : this.options.init_handler,
      init_complete_handler           : this.options.init_complete_handler,
      file_dialog_complete_handler    : this.options.file_dialog_complete_handler,
      file_queued_handler             : this.options.file_queued_handler,
      file_queue_error_handler        : this.options.file_queue_error_handler,
      queue_complete_handler          : this.options.queue_complete_handler,
      upload_start_handler            : this.options.upload_start_handler,
      upload_progress_handler         : this.options.upload_progress_handler,
      upload_success_handler          : this.options.upload_success_handler,
      upload_complete_handler         : this.options.upload_complete_handler,
      upload_error_handler            : this.options.upload_error_handler
    };
    
    // override callbacks with our own
    this.options.file_dialog_complete_handler  =  $.proxy(this.fileDialogComplete, this);
    this.options.file_queued_handler           =  $.proxy(this.fileQueued, this);
    this.options.file_queue_error_handler      =  $.proxy(this.fileQueueError, this);
    this.options.queue_complete_handler        =  $.proxy(this.queueComplete, this);
    this.options.upload_start_handler          =  $.proxy(this.uploadStart, this);
    this.options.upload_progress_handler       =  $.proxy(this.uploadProgress, this);
    this.options.upload_success_handler        =  $.proxy(this.uploadSuccess, this);
    this.options.upload_complete_handler       =  $.proxy(this.uploadComplete, this);
    this.options.upload_error_handler          =  $.proxy(this.uploadError, this);

    // creating set object
    this.set = new this.setKlass(this);
    
    var self = this;
    // now the set should have registered their callbacks already
    // we use register user callbacks now
    $.each(this.userCallbacks, function(eventName, fn){
      if(typeof fn === "function"){
        self.observe(eventName, $.proxy(fn, self));        
      }
    });

    // letting sets know it can start working!
    this.init();
  };

  SwfUploader.prototype = {
    getStatus : function() {
      return this.status;
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
      this.publish("init_handler", arguments);
      
      // creating swfuplod object
      this.swfu = new SWFUpload(this.options);
      
      this.publish("init_complete_handler", arguments);
    },
  
    // file_dialog_complete_handler
    fileDialogComplete: function(numFilesSelected, numFilesQueued, totalFilesInQueue) {
      this.status.totalFiles += numFilesSelected;
      this.publish("file_dialog_complete_handler", arguments);
    },
    
    // file_queued_handler
    fileQueued : function(file){
      this.status.numFilesQueued ++;
      this.status.totalBytes += file.size;
      this.publish("file_queued_handler", arguments);
    },
    
    // file_queue_error_handler
    fileQueueError : function(file, errorCode, message){
      this.status.numFilesFailed++;
      this.publish("file_queue_error_handler", arguments);
    },
    
    // queue_complete_handler
    queueComplete : function(numFilesUploaded){
      this.publish("queue_complete_handler", arguments);
    },
    
    // upload_start_handler
    uploadStart : function(file){
      this.status.numFilesUploading++;
      this.publish("upload_start_handler", arguments);
    },
    
    // upload_progress_handler
    uploadProgress: function(file, bytesLoaded, bytesTotal) {
      this.publish("upload_progress_handler", arguments);
    },
    
    // upload_success_handler
    uploadSuccess: function(file, serverData, response) {
      this.status.numFilesSuccess++;
      this.publish("upload_success_handler", arguments);
    },
    
    // upload_complete_handler
    uploadComplete : function(file){
      this.status.numFilesQueued--;
      this.status.numFilesUploading--;
      this.status.numFilesCompleted++;
      this.publish("upload_complete_handler", arguments);
    },
    
    // upload_error_handler
    uploadError: function(file, errorCode, message) {
      this.status.numFilesFailed++;
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
    button_text_style       : ".button {font-size: 14px; kerning: true; font-weight: bold; color: #0063DC;text-decoration:underline;text-align:center}",
    button_text_left_padding: 0,
    button_text_top_padding : 0,
    button_window_mode      : SWFUpload.WINDOW_MODE.TRANSPARENT,
    button_cursor           : SWFUpload.CURSOR.HAND,
    button_action           : SWFUpload.BUTTON_ACTION.SELECT_FILES,

    file_size_limit         : "100 MB",
    file_types              : "*.*",
    file_types_description  : "All Files",
    file_upload_limit       : 0,
    file_queue_limit        : 0    
  };

  var AbstractSet = function(swfuploader){
    this.swfuploader = swfuploader;
    this.$el = this.swfuploader.$el;
    
    this.swfuploader.observe("init_handler"                 , $.proxy(this.init, this));
    this.swfuploader.observe("init_complete_handler"        , $.proxy(this.init_complete, this));
    this.swfuploader.observe("file_dialog_complete_handler" , $.proxy(this.fileDialogComplete, this));
    this.swfuploader.observe("file_queued_handler"          , $.proxy(this.fileQueued, this));
    this.swfuploader.observe("file_queue_error_handler"     , $.proxy(this.fileQueueError, this));
    this.swfuploader.observe("queue_complete_handler"       , $.proxy(this.queueComplete, this));
    this.swfuploader.observe("upload_start_handler"         , $.proxy(this.uploadStart, this));
    this.swfuploader.observe("upload_progress_handler"      , $.proxy(this.uploadProgress, this));
    this.swfuploader.observe("upload_success_handler"       , $.proxy(this.uploadSuccess, this));
    this.swfuploader.observe("upload_complete_handler"      , $.proxy(this.uploadComplete, this));
    this.swfuploader.observe("upload_error_handler"         , $.proxy(this.uploadError, this));
  };
  
  AbstractSet.prototype = {
    // init_handler
    init  : function(){
      
    },
    
    // init_complete_handler
    init_complete : function() {
      
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

      // overridding this just in case users pass this in by accident
      // and SWFUpload gets confused over which one we want to use.
      this.swfuploader.options.button_placeholder_id = null;
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
  
  SwfUploader.I18n = {
    translate : ( typeof I18n !== "undefined" ? $.proxy(I18n.translate, I18n) : function(scope,  options){ return options["default"]; } ),
    toNumber  : ( typeof I18n !== "undefined" ? $.proxy(I18n.toNumber, I18n)  : function(number, options){ return parseInt(number.toString()); } )
  };
  
  SwfUploader.I18n.t = SwfUploader.I18n.translate;
  
  SwfUploader.formatFileSize = function(size){
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
    
    return (SwfUploader.I18n.toNumber(size) + " " + unit);
  };
  
  $.SwfUploader = SwfUploader;
})(jQuery);