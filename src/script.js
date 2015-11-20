//(function(){
	var STORE_KEY_PREFIX = 'markdown_store_';
	var ARTICLE_OPACITY = 0.6;
	var FOCUS_IN_EDITOR = true;
	var MOUSE_IN_EDITOR = false;

	var $page = $('#page');
	var $tab = $('.header .tab');
	var $body = $('body');
	var $editor = $('#editor');
	var $text = $('textarea', $editor);
	var $article = $('#article');
	var $source = $('#source');
	var $preview_sw = $('#preview-sw');
	var $source_sw = $('#source-sw');
	var $win_sw_rst = $('#win-switch-restore');
	var $win_sw_min = $('#win-switch-minimize');
	var $save_html_btn = $('#save-html-btn');
	var $save_md_btn = $('#save-md-btn');

	var $hep_chk = $('#hep-chk');
	var $ss_chk = $('#ss-chk');

	var $theme_sel = $('#theme-sel');

	var getData = function(k){
		return localStorage[STORE_KEY_PREFIX+k];
	};

	var saveData = function(k, data){
		return localStorage[STORE_KEY_PREFIX+k] = data;
	};

	var ucfirst = function(str){
		return str[0].toUpperCase()+ str.substring(1);
	};

	var scrollSynToPage = function(){
		if($ss_chk[0].checked){
			var scroll_top_percent = $text.scrollTop() / ($text[0].scrollHeight - $text.height());
			var st = ($page[0].scrollHeight-$page.height()) * scroll_top_percent;
			$page.stop();
			$page.animate({scrollTop:st}, 10);
		}
	};

	var scrollSynToText = function(){
		if($ss_chk[0].checked){
			var scroll_top_percent = $page.scrollTop() / ($page[0].scrollHeight - $page.height());
			var st = ($text[0].scrollHeight-$text.height()) * scroll_top_percent;
			$text.stop();
			$text.animate({scrollTop:st}, 10);
		}
	};

	var addSlashes = function(str){
		str = str.replace(/&/g, '&amp;')
			.replace(/>/g, '&gt;')
			.replace(/</g, '&lt;')
			.replace(/\n/g, '<br/>')
			.replace(/\r/g, '');
		return str;
	};

	var fixEditorPos = function(){
		var offset = $editor.offset();
		if((offset.top + $editor.outerHeight()) > $body.height()){
			$editor.css('top', Math.max($body.height()-$editor.outerHeight(), 0)+'px');
		}
		if((offset.left + $editor.outerWidth()) > $body.width()){
			$editor.css('left', Math.max($body.width() - $editor.outerWidth(), 0)+'px');
		}
	};

	var editorToggle = function(show){
		$text[show ? 'show':'hide']('fast');
		$win_sw_min[show?'show':'hide']();
		$win_sw_rst[show?'hide':'show']();
	};

	var download = function(filename, text) {
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		pom.setAttribute('download', filename);
		if (document.createEvent) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		}
		else {
			pom.click();
		}
	};

	$hep_chk.change(function(){
		if(!this.checked){
			$article.css('opacity', 1);
		} else {
			$article.css('opacity', ARTICLE_OPACITY);
		}
	});

	var _tm;
	$(window).resize(function(){
		clearTimeout(_tm);
		_tm = setTimeout(fixEditorPos, 100);
	});

	$source_sw.click(function(){
		$article.hide();
		$source.show();
		$tab.find('li').removeClass('active');
		$(this).addClass('active');
	});

	$preview_sw.click(function(){
		$article.show();
		$source.hide();
		$tab.find('li').removeClass('active');
		$(this).addClass('active');
	});

	$win_sw_min.click(function(){
		editorToggle(false);
	});

	$win_sw_rst.click(function(){
		editorToggle(true);
	});

	$theme_sel.change(function(){

	});

	$.each(['click', 'keydown', 'keyup', 'change'], function(k, v){
		$text[v](function(){
			var html = markdown.toHTML(this.value);
			$article.html(html);
			$source.html(addSlashes(html));
			saveData('content', this.value);

			$editor.height('auto');
			$editor.width('auto');
			scrollSynToPage();
		});
	});

	$text.scroll(function(){
		if(MOUSE_IN_EDITOR){
			scrollSynToPage();
		}
	});
	$page.scroll(function(){
		if(!MOUSE_IN_EDITOR){
			scrollSynToText();
		}
	});

	$text.mousemove(function(){
		$editor.height('auto');
		$editor.width('auto');
	});

	$text.keydown(function(e){
		if(e.keyCode == 9){
			e.preventDefault();
			var indent = '\t';
			var start = this.selectionStart;
			var end = this.selectionEnd;
			var selected = window.getSelection().toString();
			selected = indent;
			this.value = this.value.substring(0,start) + selected + this.value.substring(end);
			this.setSelectionRange(start+indent.length,start+selected.length);
		}
	});

	$editor.mouseover(function(){
		MOUSE_IN_EDITOR = true;
	});

	$editor.mouseout(function(){
		MOUSE_IN_EDITOR = false;
	});

	$editor.mouseup(function(){
		$editor.css('position', 'fixed');
		saveData('pos_top', $editor.offset().top);
		saveData('pos_left', $editor.offset().left);
	});

	$editor.dblclick(function(event){
		if(event.target == this){
			if($text.css('display') == 'none') {
				editorToggle(true);
			} else {
				editorToggle(false);
			}
		}
	});

	$save_html_btn.click(function(){
		var title = $article.find('h1').html() || $article.find('h2').html() || 'text';
		download(title+'.html', $article.html());
	});

	$save_md_btn.click(function(){
		var title = $article.find('h1').html() || $article.find('h2').html() || 'text';
		download(title+'.md', $text.val());
	});

	$body.mousedown(function(e){
		var in_editor = $.contains($editor[0], e.target) || $editor[0] == e.target;
		if($hep_chk[0].checked){
			$editor[in_editor ? 'removeClass' : 'addClass']('editor-blur');
			$article.css('opacity', in_editor ? ARTICLE_OPACITY : 1);
		}
		FOCUS_IN_EDITOR = in_editor;
	});

	$(function(){
		$editor.draggable({containment:$page, scroll: false });
		$article.css('opacity', ARTICLE_OPACITY);
	});

	var content = getData('content');
	if(content){
		$text.val(content).focus().trigger('change');
	}

	var pos_top = getData('pos_top');
	var pos_left = getData('pos_left');
	if(pos_top && pos_left){
		$editor.css('left', pos_left+'px');
		$editor.css('top', pos_top+'px');
		$editor.css('right', 'inherit');
		$editor.css('bottom', 'inherit');
	}
//})();