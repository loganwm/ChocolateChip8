//var fs = require('fs');

var Chip8Emulator = function()
{
	this.memory = []; //Address space starts at 200h
	this.registers = []; //V0 through VF
	this.keys = [];
	this.stack = []; //Should nest at least 12 address (used for subroutines)
	this.delay_timer = 0; //ticks down at 60hz
	this.sound_timer = 0; //ticks down at 60hz, beeps until zero
	this.address_register = 0;
	this.instruction_register = 0x200;
	
	this.waiting_for_input = false;
	
	this.video_memory = [];
	
		for (var x = 0; x < 64; x++)
		{
			this.video_memory[x] = [];

			for (var y = 0; y < 32; y++)
			{
				this.video_memory[x][y] = 0;
			}
		}
	
};

Chip8Emulator.prototype =
{
	debugPrintRegisters: function()
	{
		document.write('V0: ' + this.registers[0x0] + ' V1: ' + this.registers[0x1] + ' V2: ' + this.registers[0x2] +' V3: ' +  this.registers[0x3] + '</br>');
		document.write('V4: ' + this.registers[0x4] + ' V5: ' + this.registers[0x5] + ' V6: ' + this.registers[0x6] +' V7: ' +  this.registers[0x7] + '</br>');
		document.write('V8: ' + this.registers[0x8] + ' V9: ' + this.registers[0x9] + ' VA: ' + this.registers[0xA] +' VB: ' +  this.registers[0xB] + '</br>');
		document.write('VC: ' + this.registers[0xC] + ' VD: ' + this.registers[0xD] + ' VD: ' + this.registers[0xE] +' VF: ' +  this.registers[0xF] + '</br>');
		document.write('Delay: ' + this.delay_timer + '</br>');
	},

	//Zeroes out ROM but not registers
	clearROM: function()
	{
		for (var index = 0; index < 4096; index++)
		{
			this.memory[index] = 0;
		}
		
		this.ROM_size = 0;
	},

	//Zeroes out ROM but not registers
	clearScreen: function()
	{
		for (var x = 0; x < 64; x++)
		{
			for (var y = 0; y < 32; y++)
			{
				this.video_memory[x][y] = 0;
			}
		}
		
		this.ROM_size = 0;
	},
	
	//Clear registers
	resetRegisters: function()
	{
		//clear the big 16
		for (var register = 0; register < 16; register++)
		{
			this.registers[register] = 0;
		}
		
		//clear address register
		this.address_register = 0;

		//clear timers
		this.delay_timer = 0;
		this.sound_timer = 0;
		
		//clear instruction register
		this.instruction_register = 0;
	},
	
	//Clear the stack
	clearStack: function()
	{

	},
	
	//Load a ROM into memory
	loadROM: function(data)
	{	
		//Get the machine ready for a fresh ROM
		this.clearROM();
		this.clearStack();
		this.resetRegisters();
		this.clearScreen();
		
		/* Copy the program into memory starting at address 0x200 */
		for (var index = 0; index < data.length; index++)
		{
			this.memory[index+0x200] = data[index];
		}

		/* Set the instruction pointer to the beginning of program memory */
		this.instruction_register = 0x200;
	},

	pressKey: function(key)
	{
		this.waiting_for_input = false;

		if (this.keys[key] !== true)
		{
			this.keys[key] = true;
		}
	},

	releaseKey: function(key)
	{
		if (this.keys[key] === true)
		{
			this.keys[key] = false;
		}
	},


	/**************************************
	Begin Opcodes
	***************************************/
	opcode0NNN: function(opcode)
	{
		console.log("Call RCA 1802 Program");
	},
	
	opcode00E0: function(opcode)
	{
		this.clearScreen();
		
		console.log("Clear Screen");
	},

	opcode00EE: function(opcode)
	{	
		/* Store our return point */
		var address = this.stack.pop();

		this.instruction_register = address;

		//document.write('return from subroutine ' + address + '</br>');
	
		console.log("Return from Subroutine");
	},
	
	opcode1NNN: function(opcode)
	{
		var address = (opcode & 0x0F00) + (opcode & 0x00FF);

		this.instruction_register = address;
	
		console.log("Jump to Address");
	},

	opcode2NNN: function(opcode)
	{
		/* Store our return point */
		this.stack.push(this.instruction_register)
		var address = (opcode & 0x0F00) + (opcode & 0x00FF);

		this.instruction_register = address;

		//document.write('jump to subroutine ' + address + '</br>');
	
		console.log("Call Subroutine");
	},

	opcode3XNN: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		var value = (opcode & 0x00FF);		
		
		if (this.registers[register] === value)
		{
			this.instruction_register = this.instruction_register + 2;
		}
	
		console.log("Skip Next Instruction If VX Equals NN");
	},

	opcode4XNN: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		var value = (opcode & 0x00FF);
		
		if (this.registers[register] !== value)
		{
			this.instruction_register = this.instruction_register + 2;
		}

		console.log("Skip Next Instruction If VX Does Not Equal NN");
	},

	opcode5XY0: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;
		
		if (this.registers[register_x] === this.registers[register_y])
		{
			this.instruction_register = this.instruction_register + 2;
		}

		console.log("Skip Next Instruction If VX Equals VY");
	},

	opcode6XNN: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		var value = (opcode & 0x00FF);

		this.registers[register] = value;
		console.log("Set VX Equal to NN");
	},

	opcode7XNN: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		var value = (opcode & 0x00FF);

		this.registers[register] = this.registers[register] + value;

		/* I'm assuming that overflow just flips back to zero */
		if (this.registers[register] > 15)
		{
			this.registers[register] = 0;
		}

		console.log("Add NN to VX");
	},

	opcode8XY0: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;

		this.registers[register_x] = this.registers[register_y];

		console.log("Sets VX to the value of VY");
	},

	opcode8XY1: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;

		this.registers[register_x] = this.registers[register_x] | this.registers[register_y];

		console.log("Sets VX to the value of VX OR VY");
	},

	opcode8XY2: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;

		this.registers[register_x] = this.registers[register_x] & this.registers[register_y];

		console.log("Sets VX to the value of VX AND VY");
	},

	opcode8XY3: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;

		this.registers[register_x] = this.registers[register_x] ^ this.registers[register_y];

		console.log("Sets VX to the value of VX XOR VY");
	},

	opcode8XY4: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;

		this.registers[register_x] = this.registers[register_x] + this.registers[register_y];

		if (this.registers[register_x] > 15)
		{
			this.registers[register_x] = 0;
			
			/* Carry flag */
			this.registers[0xF] = 0x1;
		}
		else
		{
			/* Carry flag */
			this.registers[0xF] = 0x0;
		}

		console.log("Adds VY to VX. VF is set to 0 when there's a borrow, and 1 otherwise");
	},

	opcode8XY5: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;

		this.registers[register_x] = this.registers[register_x] - this.registers[register_y];

		if (this.registers[register_x] < 0)
		{
			this.registers[register_x] = 0;
			
			/* Carry flag */
			this.registers[0xF] = 0x0;
		}
		else
		{
			/* Carry flag */
			this.registers[0xF] = 0x1;
		}

		console.log("Subtracts VY from VX. VF is set to 0 when there's a borrow, and 1 otherwise");
	},

	opcode8XY6: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		var least_significant_bit = (this.registers[register] & 0x01);

		this.registers[register_x] = this.registers[register_x] >> 1;

		/* Carry flag */
		this.registers[0xF] = least_significant_bit;

		console.log("Shifts VX right by 1. VF set to value of least significant bit of VX before shift");
	},

	opcode8XY7: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;

		this.registers[register_x] = this.registers[register_y] - this.registers[register_x];

		if (this.registers[register_x] < 0)
		{
			this.registers[register_x] = 0;
			
			/* Carry flag */
			this.registers[0xF] = 0x0;
		}
		else
		{
			/* Carry flag */
			this.registers[0xF] = 0x1;
		}

	
		console.log("Sets VX to VY minus VX. VF set to 0 when there's a borrow, and 1 otherwise");
	},
	
	opcode8XYE: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		var most_significant_bit = (this.registers[register] & 0x80) >> 7;

		this.registers[register_x] = this.registers[register_x] << 1;

		/* Carry flag */
		this.registers[0xF] = most_significant_bit;

		console.log("Shits VX left by 1. VF set to the value of most significant bit of VX before shift");
	},
	
	opcode9XY0: function(opcode)
	{
		var register_x = (opcode & 0x0F00) >> 8;
		var register_y = (opcode & 0x00F0) >> 4;
		
		if (this.registers[register_x] !== this.registers[register_y])
		{
			this.instruction_register = this.instruction_register + 2;
		}
	
		console.log("Skips Next Instruction If VX Does Not Equal VY");
	},

	opcodeANNN: function(opcode)
	{	
		var address = (opcode & 0x0F00) + (opcode & 0x00FF);

		this.address_register = address;
		
		console.log("Sets I to Address NNN");
	},
	
	opcodeBNNN: function(opcode)
	{
		var address = (opcode & 0x0F00) + (opcode & 0x00FF) + this.registers[0];

		this.address_register = address;
		
		console.log("Jump to Address NNN plus V0");	
	},

	opcodeCXNN: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		var base_value = (opcode & 0x00FF);
		var random_number = Math.floor(Math.random() * 256);

		this.registers[register] = random_number + base_value;
		
		if (this.registers[register] > 255)
		{
			this.registers[register] = 0;
		}

		console.log("Sets VX to Random Number and NN");
	},

	opcodeDXYN: function(opcode)
	{
		console.log("Draws a sprite at (VX,VY) With Width 8 and height N. VF Set to 1 if any pixels flipped");
	},

	opcodeEX9E: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		
		if (this.keys[register] === true)
		{
			this.instruction_register = this.instruction_register + 2;
		}
	
		console.log("Skips next instruction if ket stored in VX is pressed");
	},

	opcodeEXA1: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;
		
		if (this.keys[register] === false)
		{
			this.instruction_register = this.instruction_register + 2;
		}

		console.log("Skips next instruction if ket stored in VX is not pressed");
	},

	opcodeFX07: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;

		this.registers[register] = this.delay_timer;
	
		console.log("Set VX to the value of the delay timer");
	},

	opcodeFX0A: function(opcode)
	{
		/* This opcode can go to hell */

		document.write('fuck');

		console.log("Wait for keypress, then store in VX");
	},

	opcodeFX15: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;

		this.delay_timer = this.registers[register];
	
		console.log("Set delay timer to VX");
	},

	opcodeFX18: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;

		this.sound_timer = this.registers[register];

		console.log("Set sound timer to VX");
	},

	opcodeFX1E: function(opcode)
	{
		var register = (opcode & 0x0F00) >> 8;

		this.address_register = this.registers[register];

		console.log("Add VX to I");
	},

	opcodeFX29: function(opcode)
	{
		/* Need to handle pointing to font sprites */

		console.log("Set I to the location of the sprite for character VX");
	},

	opcodeFX33: function(opcode)
	{
		console.log("This opcode needs to be read over at a point when I'm not asleep");
		console.log("sheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeit");
	},

	opcodeFX55: function(opcode)
	{
		console.log("Stores V0 to VX in memory starting at address I");
	},

	opcodeFX65: function(opcode)
	{
		console.log("Fills V0 to VX with values from memory starting at address I");
	},

	/**************************************
	End Opcodes
	***************************************/
	
	decodeOpcode: function(opcode)
	{	
		switch(opcode & 0xF000)
		{
			case 0x0000:
				switch(opcode & 0x0FFF)
				{
					case 0x00E0:
						this.opcode00E0(opcode);
						break;
					case 0x00EE:
						this.opcode00EE(opcode);
						break;
					default:
						this.opcode0NNN(opcode);
						break;
				}
				break;
			case 0x1000:
				this.opcode1NNN(opcode);
				break;
			case 0x2000:
				this.opcode2NNN(opcode);
				break;
			case 0x3000:
				this.opcode3XNN(opcode);
				break;
			case 0x4000:
				this.opcode4XNN(opcode);
				break;
			case 0x5000:
				this.opcode5XY0(opcode);
				break;
			case 0x6000:
				this.opcode6XNN(opcode);
				break;
			case 0x7000:
				this.opcode7XNN(opcode);
				break;
			case 0x8000:
				switch(opcode & 0x000F)
				{
					case 0x0001:
						this.opcode8XY1(opcode);
						break;
					case 0x0002:
						this.opcode8XY2(opcode);
						break;
					case 0x0003:
						this.opcode8XY3(opcode);
						break;
					case 0x0004:
						this.opcode8XY4(opcode);
						break;
					case 0x0005:
						this.opcode8XY5(opcode);
						break;
					case 0x0006:
						this.opcode8XY6(opcode);
						break;
					case 0x0007:
						this.opcode8XY7(opcode);
						break;
					case 0x000E:
						this.opcode8XYE(opcode);
						break;
				}
				break;
			case 0x9000:
				this.opcode9XY0(opcode);
				break;
			case 0xA000:
				this.opcodeANNN(opcode);
				break;
			case 0xB000:
				this.opcodeBNNN(opcode);
				break;
			case 0xC000:
				this.opcodeCXNN(opcode);
				break;
			case 0xD000:
				this.opcodeDXYN(opcode);
				break;
			case 0xE000:
				switch(opcode & 0x00FF)
				{
					case 0x009E:
						this.opcodeEX9E(opcode);
						break;
					case 0x00A1:
						this.opcodeEXA1(opcode);
						break;
				}
				break;
			case 0xF000:
				switch(opcode & 0x00FF)
				{
					case 0x0007:
						this.opcodeFX07(opcode);
						break;
					case 0x000A:
						this.opcodeFX0A(opcode);
						break;
					case 0x0015:
						this.opcodeFX15(opcode);
						break;
					case 0x0018:
						this.opcodeFX18(opcode);
						break;
					case 0x001E:
						this.opcodeFX1E(opcode);
						break;
					case 0x0029:
						this.opcodeFX29(opcode);
						break;
					case 0x0033:
						this.opcodeFX33(opcode);
						break;
					case 0x0055:
						this.opcodeFX55(opcode);
						break;
					case 0x0065:
						this.opcodeFX65(opcode);
						break;
				}
				break;
		}
	},

	executeFrame: function()
	{
		/* Build a big fat opcode */
		var opcode = this.memory[this.instruction_register];
		opcode = opcode << 8;
		opcode = opcode + this.memory[this.instruction_register+1];
		
		/* Increment instruction pointer */
		/* Note: Since we set this before jumps would occur */
		this.instruction_register = this.instruction_register + 2;

		/* Figure out which opcode it is and act accordingly */
		this.decodeOpcode(opcode);

		//document.write(opcode.toString(16) + '</br>');
		//this.debugPrintRegisters();

		/* Decrement delay timer */
		if (this.delay_timer > 0)
		{
			this.delay_timer--;
		}

		/* Decrement sound timer */
		if (this.sound_timer > 0)
		{
			this.sound_timer--;
		}
	}
};


