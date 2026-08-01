package guitarpro

import (
	"encoding/binary"
	"errors"
	"io"
	"math"
)

// BinaryReader provee utilidades de lectura binaria para estructuras de archivos GuitarPro GP3/GP4/GP5.
type BinaryReader struct {
	r io.Reader
}

func NewBinaryReader(r io.Reader) *BinaryReader {
	return &BinaryReader{r: r}
}

func (b *BinaryReader) ReadByte() (byte, error) {
	var buf [1]byte
	_, err := io.ReadFull(b.r, buf[:])
	return buf[0], err
}

func (b *BinaryReader) ReadBool() (bool, error) {
	val, err := b.ReadByte()
	return val != 0, err
}

func (b *BinaryReader) ReadInt16() (int16, error) {
	var val int16
	err := binary.Read(b.r, binary.LittleEndian, &val)
	return val, err
}

func (b *BinaryReader) ReadInt32() (int32, error) {
	var val int32
	err := binary.Read(b.r, binary.LittleEndian, &val)
	return val, err
}

func (b *BinaryReader) ReadFloat32() (float32, error) {
	bits, err := b.ReadInt32()
	if err != nil {
		return 0, err
	}
	return math.Float32frombits(uint32(bits)), nil
}

// ReadBytePascalString lee una cadena con formato Pascal (1 byte de longitud + caracteres ASCII)
func (b *BinaryReader) ReadBytePascalString() (string, error) {
	length, err := b.ReadByte()
	if err != nil {
		return "", err
	}
	if length == 0 {
		return "", nil
	}
	buf := make([]byte, length)
	_, err = io.ReadFull(b.r, buf)
	return string(buf), err
}

// ReadIntPascalString lee una cadena en formato GP (4 bytes de tamaño máximo + 1 byte de longitud de datos + caracteres)
func (b *BinaryReader) ReadIntPascalString(maxLen int) (string, error) {
	actualLen, err := b.ReadByte()
	if err != nil {
		return "", err
	}
	buf := make([]byte, maxLen)
	_, err = io.ReadFull(b.r, buf)
	if err != nil {
		return "", err
	}
	if int(actualLen) > maxLen {
		actualLen = byte(maxLen)
	}
	return string(buf[:actualLen]), nil
}

// Skip avanza n bytes en el flujo de lectura
func (b *BinaryReader) Skip(n int64) error {
	if seeker, ok := b.r.(io.Seeker); ok {
		_, err := seeker.Seek(n, io.SeekCurrent)
		return err
	}
	buf := make([]byte, n)
	_, err := io.ReadFull(b.r, buf)
	return err
}

// ReadVersionString lee la firma de encabezado de la versión de GuitarPro (ej. "FICHIER GUITAR PRO v3.00")
func (b *BinaryReader) ReadVersionString() (string, error) {
	verStr, err := b.ReadIntPascalString(30)
	if err != nil {
		return "", errors.New("error leyendo firma de versión GP")
	}
	return verStr, nil
}
