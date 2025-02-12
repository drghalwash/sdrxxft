
	<nav class="unique-navbar">
		<div class="distinct-logo"><a href="/Home"><img src="/images/new-logo.png"> </a></div>
		<div class="menu-toggle" id="toggle-button">
			<div class="toggle-lines">
				<span style=" width: 15px; "></span>
				<span style=" width: 20px;"></span>
				<span style=" width: 15px;"></span>
			</div>
			<span class="menu-text">Menu</span>
		</div>
		<div class="rare-menu" id="menu">
			<a href="/Home" class="uncommon-link">HOME</a>
			<div class="dropdown">
				<a id="about" href="#" class="uncommon-link">ABOUT US <span class="dropdown-arrow">&#9662;</span></a>
				<ul class="dropdown-menu">
					<li><a href="/About_Us/Dr_Khaled" class="dropdown-link">Meet Dr.Khaled</a></li>
					<li><a href="/About_Us/Dr_Mohamed" class="dropdown-link">Meet Dr.Mohammed</a></li>
					<li><a href="/Choose" class="dropdown-link">How to Choose A Plastic Surgeon</a></li>
				</ul>
			</div>

			<div class="dropdown">
				<a href="#" class="uncommon-link">PHOTO GALLERY <span class="dropdown-arrow">&#9662;</span></a>
				<ul class="dropdown-menu">
					{{#each Photo_Gallary}}
					<li><a href="/Photo_Gallary/{{_id}}" class="dropdown-link">{{name}}</a></li>
					{{/each}}
					<li><a href="/Guidelines" class="dropdown-link">Photography Guidelines</a></li>
				</ul>
			</div>
