/*
 * Released under BSD License
 * Copyright (c) 2016 gagoit
 * 
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

//jmpopup

(function($w){
    'use strict';
    var $d = $w.document;
    var __name__ = 'jsMind';
    var jsMind = $w[__name__];
    if(!jsMind){return;}
    if(typeof jsMind.rightclick != 'undefined'){return;}

    var jdom = jsMind.util.dom;
    var jcanvas = jsMind.util.canvas;

    var clear_selection = 'getSelection' in $w ? function(){
         $w.getSelection().removeAllRanges();
    } : function(){
         $d.selection.empty();
    };

    var options = {
        line_width : 5,
        lookup_delay : 500,
        lookup_interval : 80
    };

    jsMind.rightclick = function(jm){
        this.jm = jm;
        this.e_popup = null;
    };

    jsMind.rightclick.prototype = {
        init:function(){
            this._create_popup();
            this._event_bind();
        },

        _create_popup: function(){
            
            var popup = $d.createElement('ul');
            this.jm.view.e_panel.appendChild(popup);
            popup.classList = "jmpopup dropdown-menu";
            
            var labels =["#fdab3d", "#00c875", "#e2445c", "#0086c0", "#579bfc", "#a25ddc", "#037f4c", "#CAB641", "#FFCB00", "#333333", "#c4c4c4"];
            var labels_html = "";
            $.each(labels, function(index, color){
              labels_html += '<li>' +
                      '<a class="jmpopup_add_label" data-color="' + color + '"><i class="glyphicon glyphicon-tag" style="color: ' + color + '"></i>&nbsp; ' + color + '</a>' +
                    '</li>';
            });

            popup.innerHTML = 
                '<li class="dropdown-submenu">' +
                  '<a tabindex="-1" href="#">Insert</a>' +
                  '<ul class="dropdown-menu">' +
                    '<li>' +
                      '<a class="jmpopup_add_node" data-category="child"><i class="glyphicon glyphicon-download icon-rotate-270"></i>&nbsp;Add Child</a>' +
                    '</li>' +

                    '<li>' +
                      '<a class="jmpopup_add_node" data-category="sibling"><i class="glyphicon glyphicon-download"></i>&nbsp;Add Sibling</a>' +
                    '</li>' +
                    
                    '<li>' +
                      '<a class="jmpopup_add_node" data-category="parent"><i class="glyphicon glyphicon-download icon-rotate-90"></i>&nbsp;Add Parent</a>' +
                    '</li>' +
                  '</ul>' +
                '</li>' +

                '<li>' +
                  '<a class="jmpopup_delete_node"><i class="glyphicon glyphicon-remove"></i>&nbsp;Delete</a>' +
                '</li>' +

                '<li>' +
                  '<a class="jmpopup_edit_node"><i class="glyphicon glyphicon-pencil"></i>&nbsp;Edit node text</a>' +
                '</li>' +

                '<li>' +
                  '<a><i class="glyphicon glyphicon-user"></i>&nbsp;Add Person</a>' +
                '</li>' +

                '<li class="dropdown-submenu">' +
                  '<a tabindex="-1" href="#">Add Label</a>' +
                  '<ul class="dropdown-menu">' +  labels_html + '</ul>' +
                '</li>';

            this.e_popup = popup;

        },

        _show_popup: function(){
          this.e_popup.style.display = "block";
        },

        _hide_popup: function(){
          this.e_popup.style.display = "none";
        },

        _event_bind:function(){
          var jd = this;
          var container = this.jm.view.container;

          jdom.add_event(container,'contextmenu',function(e){
            e.preventDefault();
            return false;
          });

          jdom.add_event(container,'mousedown',function(e){
            if($(e.target).closest(".jmpopup").length > 0){
              return false;
            }

            jd._hide_popup();

            if( e.button == 2 ) {
              var selected_node = jd.jm.get_selected_node();

              if(selected_node){
                jd._show_popup();
                var top = (selected_node._data.view.abs_y + 15);
                var left = (selected_node._data.view.abs_x + selected_node._data.view.width);

                jd.e_popup.style.top = top  + 'px';
                jd.e_popup.style.left = left + 'px';
                $(container).find(".jsmind-inner").scrollLeft(left);
                $(container).find(".jsmind-inner").scrollTop(top);
              }
            }
            return true; 
          });

          $(container).on("click", ".jmpopup_add_node", function(e){
            var category = $(e.target).data("category");

            jd._add_node(category);
            jd._hide_popup();
          });

          $(container).on("click", ".jmpopup_delete_node", function(e){
            jd._remove_node();
            jd._hide_popup();
          });

          $(container).on("click", ".jmpopup_edit_node", function(e){
            jd._edit_node();
            jd._hide_popup();
          });

          $(container).on("click", ".jmpopup_add_label", function(e){
            var color = $(e.target).data("color");

            jd._add_label(color);
            jd._hide_popup();
          });
        },

        _get_selected_nodeid: function(){
          var selected_node = this.jm.get_selected_node();
          if(!!selected_node){
            return selected_node.id;
          }else{
            return null;
          }
        },

        _add_node: function(category){
          var selected_node = this.jm.get_selected_node();
          if(!selected_node){alert('please select a node first.');}

          var nodeid = jsMind.util.uuid.newid();
          var topic = 'Enter name';;
          var node = null;

          if(category == "child"){
            node = this.jm.add_node(selected_node, nodeid, topic);

          }else if(category == "sibling"){
            var parent = selected_node.parent;
            node = this.jm.add_node(parent, nodeid, topic);

          }else if(category == "parent"){
            var parent = selected_node.parent;
            node = this.jm.add_node(parent, nodeid, topic);
            this.jm.move_node(selected_node, parent.id, node.id, parent.direction);
            
          }else {
            return;
          }

          this.jm.begin_edit(nodeid);
        },

        _edit_node: function(){
          var selected_id = this._get_selected_nodeid();
          if(!selected_id){alert('please select a node first.');}

          this.jm.begin_edit(selected_id);
        },

        _remove_node: function(){
          var selected_id = this._get_selected_nodeid();
          if(!selected_id){alert('please select a node first.');}

          this.jm.remove_node(selected_id);
        },

        _add_label: function(color){
          var selected_id = this._get_selected_nodeid();
          if(!selected_id){alert('please select a node first.');}

          this.jm.set_node_color(selected_id, color);
        }
    };

    var rightclick_plugin = new jsMind.plugin('rightclick',function(jm){
        var jd = new jsMind.rightclick(jm);
        jd.init();
    });

    jsMind.register_plugin(rightclick_plugin);

})(window);
