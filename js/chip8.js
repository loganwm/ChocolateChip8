//var fs = require('fs');

var Chip8Emulator = function()
{
	this.memory = []; //Address space starts at 200h
	this.registers = []; //V0 through VF
	this.stack = []; //Should nest at least 12 address (used for subroutines)
	this.delay_timer = 0; //ticks down at 60hz
	this.sound_timer = 0; //ticks down at 60hz, beeps until zero
	this.address_register = 0;
	this.instruction_register = 0;
};

Chip8Emulator.prototype =
{
	printit: function()
	{
		document.write("cockcidmsif");
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
		this.instruction_register = 0;
	},
	
	//Clear the stack
	clearStack: function()
	{
		//assume size 48 until otherwise expanded
		for (var index = 0; index < 48; index++)
		{
			this.stack[index] = 0;
		}
	},
	
	//Load a ROM into memory
	loadROM: function(filename)
	{
		//Get the machine ready for a fresh ROM
		this.clearROM();
		this.clearStack();
		this.resetRegisters();
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
		console.log("Clear Screen");
	},

	opcode00EE: function(opcode)
	{
		console.log("Return from Subroutine");
	},
	
	opcode1NNN: function(opcode)
	{
		console.log("Jump to Address");
	},

	opcode2NNN: function(opcode)
	{
		console.log("Call Subroutine");
	},

	opcode3XNN: function(opcode)
	{
		console.log("Skip Next Instruction If VX Equals NN");
	},

	opcode4XNN: function(opcode)
	{
		console.log("Skip Next Instruction If VX Does Not Equal NN");
	},

	opcode5XY0: function(opcode)
	{
		console.log("Skip Next Instruction If VX Equals VY");
	},

	opcode6XNN: function(opcode)
	{
		console.log("Set VX Equal to NN");
	},

	opcode7XNN: function(opcode)
	{
		console.log("Add NN to VX");
	},

	opcode8XY0: function(opcode)
	{
		console.log("Sets VX to the value of VY");
	},

	opcode8XY1: function(opcode)
	{
		console.log("Sets VX to the value of VX OR VY");
	},

	opcode8XY2: function(opcode)
	{
		console.log("Sets VX to the value of VX AND VY");
	},

	opcode8XY3: function(opcode)
	{
		console.log("Sets VX to the value of VX XOR VY");
	},

	opcode8XY4: function(opcode)
	{
		console.log("Adds VY to VX. VF is set to 0 when there's a borrow, and 1 otherwise");
	},

	opcode8XY5: function(opcode)
	{
		console.log("Subtracts VY from VX. VF is set to 0 when there's a borrow, and 1 otherwise");
	},

	opcode8XY6: function(opcode)
	{
		console.log("Shifts VX right by 1. VF set to value of least significant bit of VX before shift");
	},

	opcode8XY7: function(opcode)
	{
		console.log("Sets VX to VY minus VX. VF set to 0 when there's a borrow, and 1 otherwise");
	},
	
	opcode8XYE: function(opcode)
	{
		console.log("Shits VX left by 1. VF set to the value of most significant bit of VX before shift");
	},
	
	opcode9XY0: function(opcode)
	{
		console.log("Skips Next Instruction If VX Does Not Equal VY");
	},

	opcodeANNN: function(opcode)
	{
		console.log("Sets I to Address NNN");
	},

	opcodeCXNN: function(opcode)
	{
		console.log("Sets VX to Random Number and NN");
	},

	opcodeDXYN: function(opcode)
	{
		console.log("Draws a sprite at (VX,VY) With Width 8 and height N. VF Set to 1 if any pixels flipped");
	},

	opcodeEX9E: function(opcode)
	{
		console.log("Skips next instruction if ket stored in VX is pressed");
	},

	opcodeEXA1: function(opcode)
	{
		console.log("Skips next instruction if ket stored in VX is not pressed");
	},

	opcodeFX07: function(opcode)
	{
		console.log("Set VX to the value of the delay timer");
	},

	opcodeFX0A: function(opcode)
	{
		console.log("Wait for keypress, then store in VX");
	},

	opcodeFX15: function(opcode)
	{
		console.log("Set delay timer to VX");
	},

	opcodeFX18: function(opcode)
	{
		console.log("Set sound timer to VX");
	},

	opcodeFX1E: function(opcode)
	{
		console.log("Add VX to I");
	},

	opcodeFX29: function(opcode)
	{
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
	
	executeROM: function()
	{
		for (var index = 0; index < this.ROM_size; index = index + 2)
		{
			var x = Math.abs(this.memory.readInt16BE(index));
			//this.decodeOpcode(this.memory.readInt16BE(index));
			//console.log("Code: " + x.toString(16));
		}
	}
	
};


