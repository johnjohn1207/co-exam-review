# ==============================================================================
# Course:        CO3020 Computer Organization
# Assignment:    Assignment #2 - MIPS Individual Programming Assignment
# Student Name:  江源輝
# Student ID:    115423067
# AI-use Statement:
#   I developed and implemented the initial C++ reference logic independently. 
#   I utilized Google Antigravity (Gemini) as an interactive pedagogical tool to:
#   1. Guide me step-by-step through translating my C++ logic into MIPS assembly language.
#   2. Design and verify the 12-byte stack frame layout and MIPS calling conventions.
#   3. Review and ensure completeness of the technical explanations regarding program flow and register interactions.
#   All submitted code, stack frame mechanics, and execution flows have been thoroughly verified, tested, and fully understood by myself.
# ==============================================================================
	.data
prompt:.asciiz "Enter n (0-20): "
error_msg:.asciiz "Invalid input. Please enter a value from 0 to 20.\n"
result_msg:.asciiz "Fibonacci sequence: "
comma:.asciiz ", "
newline:.asciiz "\n"

	.text
	.globl main

# main function

main:
# 1. input valid loop (0<=n<=20)
input_loop:
	la $a0, prompt #print input prompt
	li $v0, 4
	syscall
	
	li $v0, 5 #read int n from user
	syscall
	move $s1, $v0 #save n in $s1(callee-saved)
	
	bltz $s1, input_error #if n<0 branch to error
	li $t0, 20
	slt $at, $t0, $s1
	bne $at, $zero, input_error #if n>20 branch to error
	j start_sequence #input is valid proceed to sequence generation
input_error:
	la $a0, error_msg # print error message
	li $v0, 4
	syscall # prompt again
	j    input_loop
# 2. sequence output loop(for i=0 to n)
start_sequence:
	la $a0, result_msg #print "Fibonacci sequence: "
	li $v0, 4
	syscall
	
	li $s0, 0 #loop counter i =0　（saved in $s0）
print_loop:
	slt $at, $s1, $s0
	bne $at, $zero, print_done # if i>n,exit loop
	
	move $a0, $s0 #pass argument i in $a0
	jal fib #call recursive procedure fib(i)
	
	move $a0, $v0 #print returned fibonacci number f(i)
	li $v0, 1
	syscall
	
	beq $s0, $s1, skip_comma# skip comma for the last term(when i==n)
	
	la $a0, comma #print ", "
	li $v0, 4
	syscall
skip_comma:
	addi $s0, $s0, 1 #i++
	j print_loop #repeat loop 
print_done:
	la $a0, newline #print newline "\n"
	li $v0, 4
	syscall
	
	li $v0, 10 # exit program cleanly(syscall 10)
	syscall

#recursive procedures: fib
#arguments: $a0 =n
#returns: $v0=f(n)
#stack frame size: 12 BYTES($ra,$a0,$s0)


fib:
    # 1. Prologue: Allocate stack space and save registers
	addi $sp, $sp, -12
	sw $ra, 8($sp) #save return address
	sw $a0, 4($sp) #save current argument n
	sw $s0, 0($sp) #save $s0 to preserve outer value
    # 2. Base Case Check: if n < 2 (對照投影片第 3 頁 slti 範例)
	slti $t0, $a0, 2
	bne $t0, $zero, fib_base
    # 3. Recursive Call 1: fib(n - 1)
	addi $a0, $a0, -1 # $a0=n-1
	jal fib # Recursive call
	move $s0, $v0 # Preserve result of fib(n - 1) in $s0
    # 4. Recursive Call 2: fib(n - 2)
	lw $a0, 4($sp) # Restore original n from stack
	addi $a0, $a0, -2  # $a0 = n - 2
	jal fib # Recursive call, result in $v0
    # 5. Combine Results: F(n) = fib(n - 1) + fib(n - 2)
	add $v0, $s0, $v0 # $v0 = $s0 + $v0
	j fib_exit
fib_base:
    # Base Case: F(0) = 0, F(1) = 1 (return n directly)
	move $v0, $a0
fib_exit:
    # 6. Epilogue: Restore registers and deallocate stack space
	lw $s0, 0($sp) # Restore $s0
	lw $a0, 4($sp) # Restore $a0
	lw $ra, 8($sp) # Restore return address $ra
	addi $sp, $sp, 12 # Deallocate 12 bytes
	jr $ra # Return to caller