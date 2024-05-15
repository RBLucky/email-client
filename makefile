# C compiler we are using
CC = gcc

# Adding compiler flags
CFLAGS = -g -Wall

# The build target:
TARGET = $(EXE)

all: $(TARGET)

$(TARGET): $(TARGET).c ; $(CC) $(CFLAGS) -o $(TARGET) $(TARGET).c $(LFLAGS)