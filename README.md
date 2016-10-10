# combox
原生js实现的简单combox，不需要任何库的依赖<br>
通过输入框和按钮、层来模拟select的行为

支持根据输入框中的内容过滤待选项<br>
combox.html为demo


示例：<br>
js部份：将下面的代码放在body的onload事件中(或者类似的文档载入完成事件的响应方法中)


    Combox({container		:"combox",
						data:[{value:"a",label:"从来不曾有太多表情"},
								{value:"b",label:"你给我的其实是无情"},
								{value:"c",label:"难道爱情真的不能要和平"},
								{value:"d",label:"谁多情谁伤心"},
								{value:"e",label:"你的过去曾经是最爱的沙"},
								{value:"f",label:"为何到现在都不能忘"},
								{value:"g",label:"难道我不能弥补你的缺憾"},
								{value:"h",label:"你不把心移转"},
								{value:"i",label:"我的心是沙漠海"},
								{value:"j",label:"多情最无奈"},
								{value:"k",label:"你的伤害一直到现在"},
								{value:"l",label:"有谁看不出来"},
								{value:"m",label:"我的心是沙漠海"},
								{value:"n",label:"要得到你的家"},
								{value:"o",label:"在你眼中看不到未来"},
								{value:"p",label:"难道你要离开"}],
						optionsMaxHeight:200,
						name:'hidden',
						onchange:function(oldData,newData){
            
							console.log('old');
							console.log(oldData);
							console.log('new');
							console.log(newData);

						}
					});
      
      
html部份：      
引入combox.js和combox.css<br>
在要放置select的地方，定义一个div，并指定id<br>
参数如下：
<table>
	<tr>
		<td>变量名</td>
		<td>说明</td>
	</tr>
	<tr>
		<td>container</td>
		<td>DIV的id</td>
	</tr>
	<tr>
		<td>data</td>
		<td>[{数据},{数据},{数据},……]</td>
	</tr>
	<tr>
		<td>label</td>
		<td>显示的数据项,可不填，默认为label</td>
	</tr>
	<tr>
		<td>inputWidth</td>
		<td>输入框的宽度，不输时为200</td>
	</tr>
	<tr>
		<td>buttonWidth</td>
		<td>按钮的宽度，不输时为20</td>
	</tr>
	<tr>
		<td>inputHeight</td>
		<td>输入框的高度，不输时为自动高度</td>
	</tr>
	<tr>
		<td>optionsMaxHeight</td>
		<td>选择列表的最大高度，不输时为500</td>
	</tr>
	<tr>
		<td>optionsMinHeight</td>
		<td>选择列表的最小高度，不输时为20</td>
	</tr>
	<tr>
		<td>name</td>
		<td>在form中提交时的数据域，为空则此数据不向form提交</td>
	</tr>
	<tr>
		<td>value</td>
		<td>通过form提交时，放在name域中的值对应的数据项，默认为value</td>
	</tr>
	<tr>
		<td>onchange</td>
		<td>选择发生变化时的事件响应方法，有两个参数，即变化前的对象，和变化后的对象</td>
	</tr>
	</table>
