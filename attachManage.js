/**
 * 附件管理
 */
var attachManage = {
	init : function(){
		var myself = this;
		
		$(function(){
			myself.control.init();
			myself.event.init();
			
			myself.query();
			
			myself.resize();
		});
		
        $(window).bind("resize", function () {
        	myself.resize();
        });
	},
	resize : function(){
		$("#panelBody").height($(window).height() - 30);
	},
	getFileType : function(attachType){
		if(attachType == "0001"){
			return "image";
		}else if(attachType == "0002"){
			return "text";
		}else if(attachType == "0003"){
			return "html";
		}else if(attachType == "0004"){
			return "office";
		}else if(attachType == "0005"){
			return "office";
		}else if(attachType == "0006"){
			return "pdf";
		}else if(attachType == "0007"){
			return "video";
		}else if(attachType == "0008"){
			return "audio";
		}else if(attachType == "0009"){
			return "other";
		}
	},
	//增加文件列表
	addFileinput : function(data){
		var myself = this;
		var downloadUrl = "../mlcommon/commonML!attachDownload.action";
		var previewData = [];
		var previewConfig = [];
		
		this._cacheData = {};
		
		//设置数据
		for(var i=0;i<data.length;i++){
			var item = data[i];
			var t = myself.getFileType(item.attachType);
			var fileExt = item.attachFilename.substr(item.attachFilename.lastIndexOf("."));
			var dlUrl = downloadUrl+"?requestParam.getContent=1&requestParam.uuid="+item.uuid;
			var type = myself.getFileType(item.attachType);
			var previewAsData = true;
			
			if(type == "text" || type == "html"){
				previewData.push(item.attachFilecontent);
			}else if(type == "audio" || type == "video"){
				previewData.push("<video src='"+dlUrl+"' style='width: auto; height: 100%; max-width: 100%;' controls='controls'>your browser does not support the video tag</video>");
				previewAsData = false;
			}else{
				previewData.push(dlUrl);
			}
			
			previewConfig.push({
				previewAsData: previewAsData,
				caption: item.attachName + "（" + item.uploadTimeStr + "）" + fileExt, 
				size: item.attachSize, 
				width: "120px", 
				type: type,
				downloadUrl: dlUrl, 
				key: item.uuid,
				showDrag: false,
				frameAttr: {
		            uuid: item.uuid
		        },
			});
			
			item.type = type;
			this._cacheData[item.uuid] = item;
		}
		
		var viewMode_list = attachManage.viewMode == "list";
		
		$("#attach-explorer").fileinput('destroy');
        $("#attach-explorer").fileinput({
            theme: viewMode_list ? "explorer-fas" : "fas",
            uploadUrl: "../mlcommon/commonML!attachUpload.action",
            uploadExtraData: function(previewId, index) {
                return {"requestParam.businessId":$("#registId").val()};
            },
            deleteUrl: "../mlcommon/commonML!attachDelete.action",
            language: "zh",
            showClose: false,
            overwriteInitial: false,
            initialPreviewAsData: true,
            initialPreview: previewData,
            initialPreviewConfig: previewConfig,
            preferIconicPreview: viewMode_list,
            previewFileIconSettings: { 
                'doc': '<i class="fas fa-file-word text-primary"></i>',
                'xls': '<i class="fas fa-file-excel text-success"></i>',
                'ppt': '<i class="fas fa-file-powerpoint text-danger"></i>',
                'pdf': '<i class="fas fa-file-pdf text-danger"></i>',
                'zip': '<i class="fas fa-file-archive text-muted"></i>',
                'htm': '<i class="fas fa-file-code text-info"></i>',
                'txt': '<i class="fas fa-file-alt text-info"></i>',
                'mov': '<i class="fas fa-file-video text-warning"></i>',
                'mp3': '<i class="fas fa-file-audio text-warning"></i>',
                'jpg': '<i class="fas fa-file-image text-danger"></i>', 
                'gif': '<i class="fas fa-file-image text-muted"></i>', 
                'png': '<i class="fas fa-file-image text-primary"></i>'    
            },
            previewFileExtSettings: { 
                'doc': function(ext) {
                    return ext.match(/(doc|docx)$/i);
                },
                'xls': function(ext) {
                    return ext.match(/(xls|xlsx)$/i);
                },
                'ppt': function(ext) {
                    return ext.match(/(ppt|pptx)$/i);
                },
                'zip': function(ext) {
                    return ext.match(/(zip|rar|tar|gzip|gz|7z)$/i);
                },
                'htm': function(ext) {
                    return ext.match(/(htm|html)$/i);
                },
                'txt': function(ext) {
                    return ext.match(/(xml|txt|ini|csv|java|php|js|css|sql|jsp)$/i);
                },
                'mov': function(ext) {
                    return ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i);
                },
                'mp3': function(ext) {
                    return ext.match(/(mp3|wav)$/i);
                }
            },
            //单个文件最大KB
            maxFileSize: 1024*5,
            //最小上传文件数
            minFileCount: 1, 
            //最大上传文件数
            maxFileCount: 10,
            //提示
            msgFilesTooMany: "选择上传的文件数量({n}) 超过允许的最大数值{m}！"
        });
	},
	query : function(){
		var param = this.getParam();
		$.ajax({
	        type:"post",
	        url:"../mlcommon/commonML!attachQuery.action",
	        dataType: "json",
	        data:param,
	        cache:false,
	        success:function(data){
	        	attachManage.addFileinput(data);
	        }
		});	
	},
	control : {
		init : function(){
			$("#uploadTime").daterangepicker({
				locale: {
	                format: "YYYY-MM-DD",
	                separator: ", "
	            }
			}).on("apply.daterangepicker", function(ev, picker) {
				attachManage.uploadTime = picker.startDate.format('YYYY-MM-DD')+","+
                    (picker.endDate?picker.endDate.format('YYYY-MM-DD'):picker.startDate.format('YYYY-MM-DD'));
    		    attachManage.query();
    	    });
			
			attachManage.uploadTime = $("#uploadTime").val();
			
			$("#attachName").keydown(function(e){
				if(e.keyCode == 13){
					attachManage.query();
				}
			})
			
			$("#attachType").change(function(){
				attachManage.query();
			})
		}
	},
	getParam : function(){
		var param = {
			requestParam:{
			    businessId:$("#registId").val(),
			    uploadTime:attachManage.uploadTime,
			    attachName:$("#attachName").val(),
			    attachType:$("#attachType").val()
        }};
		param = $.paramExtend(param);
		return param;
	},
	event : {
		init : function(){
			for(var i in this){
				if(this[i].define){
					this[i].define();
				}
			}
		},
		viewMode : {
			define : function(){
				attachManage.viewMode = "list";
				$("button[name='viewMode']").click(function(){
					var $this = $(this);
					
					$("button[name='viewMode']").removeClass("btn-info");
					$this.addClass("btn-info");
					
					if($this.attr("property") == "list"){
						attachManage.viewMode = "list";
					}else if($this.attr("property") == "thumbnail"){
						attachManage.viewMode = "thumbnail";
					}
					attachManage.query();
				});
			}
		}
	}
};

attachManage.init();