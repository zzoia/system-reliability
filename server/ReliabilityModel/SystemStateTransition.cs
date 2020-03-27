namespace ReliabilityModel.Model
{
    public class SystemStateTransition
    {
        public SystemState ToSystemState { get; set; }

        public bool IsRecovering { get; set; }

        public double WithRate { get; set; }
    }
}