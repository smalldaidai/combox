/**
	
	使用方法：
	1、在html中，需要使用下拉列表处，放置一个DIV，并设定一个id属性
	2、在body的onload事件处理方法里面，添加代码：
	
	var params = {这里按需求设定};
	Combox(params);

	其中，params变量的结构如下所示：
		params结构：

		{	container		:	DIV的id,
			data			:	[{数据},{数据},{数据},……],
			label			:	显示的数据项,可不填，默认为label,
			inputWidth		:	输入框的宽度，不输时为200
			buttonWidth		:	按钮的宽度，不输时为20
			inputHeight		:	输入框的高度，不输时为自动高度
			optionsMaxHeight:	选择列表的最大高度，不输时为500
			optionsMinHeight:	选择列表的最小高度，不输时为20,
			name			:	在form中提交时的数据域，为空则通过form提交时无数据,
			value			:	通过form提交时，放在name域中的值对应的数据项，默认为value,
			onchange		:	选择发生变化时的事件响应方法，有两个参数，即变化前的对象，和变化后的对象
		}
	
	使用时，需事先准备好data数组，可使用静态变量，也可以通过ajax从远程获取
	3、提交时，如果是用form提交，则需要将此div放在form中，同时params中的name属性和value属性要正确设定，提交后，数据域却为name

	也可通过javascript动态处理，选中的值被附加到div的对象上，可通过此div.data获得选中的对象(数组中的对象)，获取后可进行相应的处理

**/
function Combox(par){

	new (function(params){
			
			this.init = function(){
				//保存参数
				this.params = params;

				//一些默认值的设定
				this.params.optionsMaxHeight = this.params.optionsMaxHeight || 500;
				this.params.optionsMinHeight = this.params.optionsMinHeight || 20;
				this.params.inputWidth = this.params.inputWidth || 200;
				this.params.buttonWidth = this.params.buttonWidth || 20;
				this.params.label = this.params.label || 'label';
				this.params.value = this.params.value || 'value';
				this.show = false;		//这个是记录当前下拉列表是否是显示状态
				this.selecting = false;	//这个是记录当前用户是否正在选择
				this.blurtime = 0;		//这个记录上了次输入框blur的时间
				this.container = document.getElementById(params.container);	//这个就是外面那个DIV了

				this.options = [];		//这个是li对象的数组，对应的是所有的选择项
										//过滤的时候，会从中选择一部分，append到panel中
				
				this.currentOptionDataArray = [];		//这个是一个下标数组，记录了当前显示下拉列表对应的this.options数组中的下标
														//例：经过过滤后，在下拉列表中，显示了第3个和第5个选项，那么这个数组就是[2,4]
				
				this.fullOptionDataArray = [];			//这个是指全部选择项都显示时下标数组

				if(this.container == null){
					throw new Error("参数必须是一个div的id");
				}

				//创建输入框
				this.initInput();
				
				//创建输入框右边的button
				this.initButton();
				
				//创建待选择列表
				this.initOptionsPanel();
				
				//如果设定了name，创建隐藏域
				if(this.params.name){
					this.initHidden();
				}
				
				//初始化数据
				this.initData(params.data);

			}


		
			this.initData = function(data){

				if(!(Object.prototype.toString.call(data) === "[object Array]")){
					throw new Error("参数必须是一个数组");
				}
				
				this.dataIndexArray = [];

				for(i = 0 ; i < data.length ; i++){

					//初始化全量数组
					this.fullOptionDataArray[i] = i;

				}

				this.data = data;

				//生成下拉列表
				this.initOptions();
			}

			//创建用于提交的隐藏域
			this.initHidden = function(){

				this.hidden = document.createElement("input");
				this.hidden.setAttribute("type","hidden");
				this.hidden.setAttribute("name",this.params.name);
				this.container.appendChild(this.hidden);
			}

			//创建输入框
			this.initInput = function(){

				this.input = document.createElement("input");
				this.input.setAttribute("type","text");
				this.input.setAttribute("class","-combox-input");	//输入框的样式
				
				
				//输入框的宽度和高度
				this.input.style.width = this.params.inputWidth + 'px';
				if(this.params.inputHeight){
					this.input.style.height = this.params.inputHeight + 'px';
				}

				//获得焦点时，显示待选择列表
				this.input.onfocus = (function(){
					this.toggle(true);
				}).bind(this);

				//失去焦点时，如果正在选择(即鼠标在选择列表中)，则不处理，
				//否则隐藏待选择列表，记录时间
				this.input.onblur = (function(){
					if(this.selecting)
						return;
					
					this.blurtime = (new Date()).valueOf(); 
					if(this.container.value){
						this.input.value = this.container.value[this.params.label];
						this.hidden.value = this.container.value[this.params.value];
					}else{
						this.clearValue();
					}
					this.toggle(false);

					
				}).bind(this);

				//输入的时候，对输入进行过滤
				this.input.onkeyup = (function(){
				
					this.filter(this.input.value);
				
				}).bind(this);

				this.container.appendChild(this.input);
			}

			//创建按钮放在输入框右边，这样它看起来就像是一个下拉框了
			this.initButton = function(){

				this.button = document.createElement("button");

				this.button.setAttribute("class","-combox-button");	//按钮的样式

				this.button.style.height = (this.input.offsetHeight) + 'px';	//按钮的高度，跟输入框一样高

				this.button.style.width = this.params.buttonWidth + 'px';		//按钮的宽度


				this.button.innerText = '▼';				//用这个字符，让它看起来像是下拉框

				//按钮点击事件，点击按钮时，如果点击时间和输入框上次失去焦点时间超过200毫秒时，将焦点放到输入框中
				//如果不理解为什么要加上时间判断，你可以试试看把这个if注掉会是什么效果
				//主要原因是因为click的同时，输入框的blur事件会先触发……
				this.button.onclick = (function(){

					if((new Date()).valueOf() - this.blurtime > 200)
						this.input.focus();

				}).bind(this);

				this.container.appendChild(this.button);

			}

			//创建下拉列表的容器
			this.initOptionsPanel = function(){

				this.optionsPanel = document.createElement("div");
				this.optionsPanel.setAttribute("class","-combox-optionsPanel");	//样式
				this.container.appendChild(this.optionsPanel);

				//它的postion是absolute的，用top和left定位，将它放在输入框的正下面
				this.optionsPanel.style.top = this.input.style.bottom;
				this.optionsPanel.style.left = this.input.style.left;
				//它的宽度和输入框的宽度+按钮的宽度一样宽
				this.optionsPanel.style.width = (this.input.clientWidth + this.button.clientWidth) + 'px';
			}


			//创建下拉列表
			//下拉列表是使用
			//<li><div>选择项一</div></li>
			//<li><div>选择项二</div></li>
			//<li><div>选择项三</div></li>
			this.initOptions = function(){

				this.options = [];
				
				//遍历数组
				for(i = 0 ; i < this.data.length ; i++){

					var obj = this.data[i];
					var label = obj[this.params.label];
					
					//创建外层的li
					var li = document.createElement("li");
					li.setAttribute("class","-combox-li");	//li的样式

					//创建内层的div
					var div = document.createElement("div");
					div.setAttribute("class","-combox-option");//div的样式
					div.innerHTML = label;			
					div.data = obj;				//将对象附着在div对象上
					div.dataIndex = i;			//将对象在数组中的位置也附着上去
					li.appendChild(div);		//div插入到li中
					this.optionsPanel.appendChild(li);		//li插入到下拉列表容器中
					this.options[i] = li;
					


					//点击选择事件
					div.onmousedown = (function(item){	
						
						//这个data是刚才附着在div上面的，这里可以获取到
						var data = item.srcElement.data;
						var index = item.srcElement.dataIndex;

						//上次选中的和这次选中的一样，则不需要进行处理
						if(this.container.dataIndex == index){
							this.toggle(false);
							return;

						}else{
							//如果在这次选择之前，已经有选择的对象了，则将上次选中的样式清除掉
							if(this.container.dataIndex >= 0){
								this.options[this.container.dataIndex].style.backgroundColor = '';
								this.options[this.container.dataIndex].style.color = '';
							}

							//为这次选中的对象设定样式
							this.options[index].style.backgroundColor = '#0000ff';
							this.options[index].style.color = '#ffffff';
						}

						var oldData = this.container.value;
						
						//设定了onchange处理方法，则调用它
						if(this.params.onchange)
							this.params.onchange(oldData,data);

						//将选中的数据进行赋值
						this.setValue(index,data);

						//选完后，隐藏下拉列表
						this.toggle(false);

					}).bind(this);

					//鼠标进入到div，置selecting设为true，表示用户正在选择
					//这个标志在输入框的blur中有用到
					//如果无法理解它的作用，试度把它去掉会怎么样
					div.onmouseenter = (function(){
						
						this.selecting = true;

					}).bind(this);

					//鼠标离开这个div，设置selecting为false，原因同上
					div.onmouseout = (function(){
						this.selecting = false;

					}).bind(this);

				}
			}

	

			this.updateOptions = function(data){
				
				

				//不需要更新
				if((this.currentOptionDataArray.length == this.data.length) && (data.length == this.data.length)){
					
					this.currentOptionDataArray = data;
					return;

				}
				
				this.currentOptionDataArray = data;
				
				if(data.length == 0){
					this.optionsPanel.innerHTML = '----未匹配到数据----'
					return;
				}

				//清空原来的数据
				this.optionsPanel.innerHTML = '';
				
				//遍历数组
				for(i = 0 ; i < data.length ; i++){

					var index = data[i];
					this.optionsPanel.appendChild(this.options[index]);		//li插入到下拉列表容器中
				
				}
			}

			//赋值，一是将选中的数据对象中的lable值，显示到输入框中
			//		二是将选中的数据对象以及对象在数组中的位置附着在div上
			//		三是将选中的数据对象中的value值，设置到hidden域中，供form使用
			this.setValue = function(index,data){

				this.input.value = data[this.params.label];
				this.container.value = data;
				this.container.dataIndex = index;
				if(this.hidden)
					this.hidden.value = data[this.params.value];

			}

			//清除数据，清理input,div和hidden域中的数据
			this.clearValue = function(){
				
				this.input.value = '';
				this.container.value = null;
				this.container.dataIndex = -1;
				if(this.hidden)
					this.hidden.value = '';

				this.updateOptions(this.fullOptionDataArray);

			}

			//重新计算下拉列表的高度
			this.resize = function(){

				//先设为auto，浏览器自动动适配高度
				this.optionsPanel.style.height = 'auto';
				this.optionsPanel.style.width = 'auto';
				var autoHeight =  this.optionsPanel.offsetHeight;
				var autoWidth = this.optionsPanel.offsetWidth;
				
				//如果高度比最大值大，则设为最大值
				if(autoHeight > this.params.optionsMaxHeight){
					this.optionsPanel.style.height = this.params.optionsMaxHeight + 'px';
				}

				//如果比最小值小，则设为最小值
				if(autoHeight < this.params.optionsMinHeight){
					this.optionsPanel.style.height = this.params.optionsMinHeight + 'px';
				}

				if(autoWidth < this.input.clientWidth + this.button.clientWidth){
						
					this.optionsPanel.style.width = (this.input.clientWidth + this.button.clientWidth) + 'px';
	
				}
			}

			//显示或隐藏下拉列表
			this.toggle = function(flag){
				if(flag){

					//如果本就是显示状态，只需要重新确定尽寸
					if(this.show){
						this.resize();
						return;
					}


					this.show = true;
					this.filter('');

					this.optionsPanel.style.display = 'block';
					//每次显示时，都要重新计算高度
					this.resize();

					//如果已经有了选中的对象
					if(this.container.dataIndex >= 0){
						
						//将滚动条滚动到适当的位置，保证可以看到已选中的选项
						if(this.options[this.container.dataIndex].offsetTop + this.options[this.container.dataIndex].offsetHeight > this.optionsPanel.offsetHeight){
							
							this.optionsPanel.scrollTop = this.options[this.container.dataIndex].offsetTop + this.options[this.container.dataIndex].offsetHeight - this.optionsPanel.offsetHeight;

						}
						
					}

				}else{
					this.show = false;
					this.optionsPanel.style.display = 'none';
				}
			}

			//根据输入的值，对待选项进行过虑
			this.filter = function(str){

				
				//如果过滤的内容为空，则直接使用全量数组
				if(str == ''){
					this.updateOptions(this.fullOptionDataArray);
					return;
				}
				
				var data = [];

				for(i = 0 ; i < this.data.length ; i++){
				
					var label = this.data[i][this.params.label];
					//过滤时忽略大小写
					if(label.toLowerCase().indexOf(str.toLowerCase()) >= 0){

						data[data.length] = i;

					}

				}
				
				//过滤后重新生成待选项列表
				this.updateOptions(data);
				//如果当前状态是显示的，需要重新调整尺寸
				if(this.show){
					this.resize();
				}

			}
		this.init();
	})(par);
}
