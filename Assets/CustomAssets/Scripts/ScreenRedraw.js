#pragma strict

function Start () {
	InvokeRepeating("SimulateRenderTexture", 0.0, 2.0);
}

function SimulateRenderTexture () {
	renderer.material.mainTexture = RenderTextureFree.Capture();
}

public class RenderTextureFree {
	private static var tex2D : Texture2D;
	private static var tex : Texture;
	
	// Return the entire screen in a texture
	public static function Capture () : Texture {
		return Capture (new Rect(0.0, 0.0, Screen.width, Screen.height), 0, 0);
	}
	
	// Return a part of the screen in a texture
	public static function Capture (captureZone : Rect, destX : int, destY : int) {
		var result : Texture2D;
		result = new Texture2D( Mathf.RoundToInt(captureZone.width),
								Mathf.RoundToInt(captureZone.height),
								TextureFormat.RGB24, false);
		result.ReadPixels(captureZone, destX, destY, false);
		result.Apply();
		
		return result;
		
	}

}