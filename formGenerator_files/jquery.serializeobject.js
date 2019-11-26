(function($,undefined){

  $.fn.serializeObject = function(){
    var obj = {};
    
    $.each( this.serializeArray(), function(i,o){
      var n = o.name,
        v = o.value;
        
        obj[n] = v;

    });
    
    return obj;
  };
  
  $.fn.serializeObjectWithFilter = function(filter){
    var obj = {};
    var flg = filter ? true : false;
    $.each( this.serializeArray(), function(i,o){
    	if(flg){
    		if(filter(o)){
    	        obj[o.name] = o.value;
    		}
    	}else{
    		obj[o.name] = o.value;
    	}
    });
    
    return obj;
  };
  
  /**
   * 连接名称相同的节点值，用逗号分隔
   */
  $.concatInputValWithSameName = function(name){
	  var val = "";
	  var inputs = $("input[name='"+name+"']");
	  for(var i = 0; i < inputs.length; i++){
		  val += $(inputs[i]).val() + ",";
	  }
	  if(val.length > 0){
		  val = val.substring(0, val.length - 1);
	  }
	  return val;
  }
  
  /**
   * 根据表单ID，将数据赋值到对应名称的表单内节点
   */
  $.copyValueByNameForForm = function(formId, data, notClearBeforeCopy, option){
	  var $form = null
	  if(typeof(formId)=="string"){
		  $form = $("#" + formId);
	  }else{
		  $form = formId;
	  }
	  var $tags = $form.find("input,select,textarea,radio,checkbox");
	  for(var i = 0; i < $tags.length; i++){
		  var $tag = $($tags[i]);
		  var name = $tag.attr("name");
		  if(option && option.excludeNames && 
		     option.excludeNames.indexOf(name) >= 0){
			  continue;
		  }
		  if(!notClearBeforeCopy){
			  var type = $tag.attr("type");
			  if(type != "radio" && type != "checkbox"){
	              $tag.val("");
			  }
		  }
		  if(option && option.matchName){
			  name = option.matchName(name);
		  }
		  //忽略大小写
		  if(option && option.ignoreCase){
			  if(name){
				  if(data[name]){
					  $.setTagVal($tag, data[name]);
				  }else if(data[name.toLowerCase()]){
					  $.setTagVal($tag, data[name.toLowerCase()]);
				  }else if(data[name.toUpperCase()]){
					  $.setTagVal($tag, data[name.toUpperCase()]);
				  }
			  }
		  }else{
			  if(name && data[name]){
				  $.setTagVal($tag, data[name]);
			  } 
		  }
	  }
  }
  
  /**
   * 根据表单ID，将数据赋值到对应名称的表单内Label节点内容
   */
  $.copyTextByNameOfLabelForForm = function(formId, data, notClearBeforeCopy){
	  var $form = null
	  if(typeof(formId)=="string"){
		  $form = $("#" + formId);
	  }else{
		  $form = formId;
	  }
	  var $tags = $form.find("label,div[name],span[name]");
	  for(var i = 0; i < $tags.length; i++){
		  var $tag = $($tags[i]);
		  var name = $tag.attr("name");
		  if(name && !notClearBeforeCopy){
			  $tag.text("");
		  }
		  if(data && data[name]){
			  $tag.text(data[name]);
		  }
	  }
  }
  /**
   * 给节点设置值并设置效果
   */
  $.setTagVal = function($tag, value){
	  var tagName = $tag[0].tagName;
	  var type = $tag.attr("type");
	  if(tagName.toLowerCase() == "input" && (type == "radio" || type == "checkbox")){
		  $tag.get(0).checked=false; 
		  if($tag.val() == value){
			  $tag.get(0).checked=true; 
		  }
	  }else{
		  $tag.val(value);
	  }
  };
  
  /**
   * 根据表单ID,清除表单内数据,及初始化相关数据
   */
  $.clearAndInitForm = function(formId, initData, excludeNames){
	  var $form = null
	  if(typeof(formId)=="string"){
		  $form = $("#" + formId);
	  }else{
		  $form = formId;
	  }
	  var $tags = $form.find("input,select,textarea,radio,checkbox");
	  for(var i = 0; i < $tags.length; i++){
		  $tag = $($tags[i]);
		  var name = $tag.attr("name");
		  this.contain = function(arr, obj){
			  if(!arr) return false;
		      for(var i in arr){
			      if(arr[i] == obj){
				      return true;
				  }
			  }
			  return false;
		  };
		  //此处用了数组的扩展方法contain
		  if(this.contain(excludeNames,name)) continue;
		  var tagName = $tags[i].tagName;
		  
		  if(tagName && tagName.toUpperCase() == "SELECT"){
			  $tag.val($tag.find("option:eq(0)").val());
		  }else if(tagName && tagName.toUpperCase() == "INPUT" && ($tag.attr("type") == "radio" || $tag.attr("type") == "checkbox")){
			  var name = $tag.attr("name");
			  if(!name) continue;
			  $("input[name='"+name+"']").get(0).checked=true;
		  }else{
			  $tag.val("");
		  }
		  if(name && initData && initData[name]){
			  $tag.val(initData[name]);
		  }
	  }
  }
  
  /**
   * 序列化SELECT下拉框的值和文本
   */
  $.fn.serializeSelect = function(valueMember, displayMember, isMultiSelect){
	  var obj = {};
	  var $sels = this.find("select");
	  
	  if($sels.length == 0) return obj;
	  
	  var contains = function(arr, val){
		  if(arr instanceof Array){
			  for(var i=0;i<arr.length;i++){
				  if(arr[i] == val) return true;
			  }
		  }
		  return arr == val;
	  }
	  
	  for(var i = 0; i < $sels.length; i++){
		  var $sel = $($sels[i]);
		  //多选
		  if(isMultiSelect){
			  var val = $sel.val();
			  var $multiSel = $sel.find("option:selected");
			  var text = "", valu="";
			  for(var j=0;j<$multiSel.length;j++){
				  var $singleSel = $($multiSel[j]);
				  if(!contains(val, $singleSel.val())) continue;
				  valu += $singleSel.val() + ",";
				  text += $singleSel.text() + ",";
			  }
			  if(valu.length > 0){
				  valu = valu.substr(0, valu.length - 1);
			  }
			  if(text.length > 0){
				  text = text.substr(0, text.length - 1);
			  }
			  obj[$sel.attr(valueMember)] = valu ? valu : "";
			  obj[$sel.attr(displayMember)] = valu ? text : "";
		  }else{
			  var val = $sel.val();
			  obj[$sel.attr(valueMember)] = val == null ? "" : val;
			  
			  var text = $sel.find("option:selected").text();
			  obj[$sel.attr(displayMember)] = val ? text : "";
		  }
	  }
	  return obj;
  }
  
  /**
   * 序列化radio
   */
  $.fn.serializeRadio = function(formId){
	  var obj = {};
	  var $radios = $("#"+formId).find("input[type='radio']:checked");
		for(var i=0; i<$radios.length; i++){
			var $radio = $($radios[i]);
			var name = $radio.attr("name");
			obj[name] = $radio.val();
		}
	  return obj;
  }
  
})(jQuery);
